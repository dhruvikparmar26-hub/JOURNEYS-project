# JOURNEYS — Authentication Security Documentation

## Overview

This document describes the authentication and security architecture for JOURNEYS.
It is intended both as internal documentation and as a reference for security audits.

---

## Token Architecture

### Access Tokens
- **Type:** JWT (JSON Web Token)
- **Lifetime:** 15 minutes
- **Storage:** In-memory only (React state/context) — never localStorage or sessionStorage
- **Transport:** `Authorization: Bearer <token>` header
- **Payload:** `{ userId, type: 'access' }`

### Refresh Tokens
- **Type:** 32-byte cryptographically random value (hex-encoded)
- **Lifetime:** 7 days
- **Storage (client):** httpOnly, Secure, SameSite=Strict cookie
- **Storage (server):** SHA-256 hash stored in the User document — the raw token is never stored
- **Rotation:** Every time a refresh token is used, a new one is issued and the old hash is replaced

### Why This Matters
- **Short access tokens** limit the blast radius if a token is intercepted
- **httpOnly cookies** prevent XSS from stealing refresh tokens (injected scripts cannot read httpOnly cookies)
- **Token hashing** means a database breach doesn't yield working sessions
- **Rotation** means a stolen refresh token can only be used once before it's invalidated

---

## Refresh Token Reuse Detection

If a refresh token is presented that doesn't match any stored hash, this indicates one of:
1. **Token theft** — an attacker copied a refresh token that has since been rotated
2. **Race condition** — two legitimate tabs tried to refresh simultaneously (less likely with our approach)

**Current behavior:** The mismatched token is rejected, the cookie is cleared, and a `token_reuse_detected` event is logged to the audit collection.

**Not yet implemented:**
- Automatically invalidating ALL sessions for the affected user (recommended for high-security deployments)
- Notifying the user via email about the suspicious activity

---

## Password Security

### Algorithm: Argon2id
- **Why Argon2id over bcrypt:** Argon2id is memory-hard (resistant to GPU/ASIC attacks) and provides hybrid protection against both side-channel and brute-force attacks. Bcrypt is time-hard only.
- **Parameters:**
  - Memory cost: 64 MB (`memoryCost: 65536`)
  - Time cost: 3 iterations (`timeCost: 3`)
  - Parallelism: 4 threads (`parallelism: 4`)
- **Salt:** Handled internally by the argon2 library — no manual salt management required.

### Password Requirements
- Minimum 12 characters
- Must contain: uppercase, lowercase, number, special character
- Validated server-side with Zod schemas (client-side validation is cosmetic only)

---

## Account Lockout Policy

- **Threshold:** 5 consecutive failed login attempts
- **Lock duration:** 15 minutes
- **Behavior:**
  - After each failed attempt, `failedLoginAttempts` is incremented
  - At 5 failures, `lockedUntil` is set to `now + 15 minutes` and the counter resets
  - While locked, all login attempts are immediately rejected with a countdown
  - On successful login, both `failedLoginAttempts` and `lockedUntil` are reset

---

## Rate Limiting

### Auth Endpoints (`/api/auth/login`, `/api/auth/signup`)
- **Hard limit:** 10 requests per 15 minutes per IP
- **Progressive slow-down:** After 5 requests, each subsequent request is delayed by 500ms (up to 5s max)
- **Purpose:** Prevents credential stuffing and brute-force attacks without breaking legitimate retries

### General API
- **Limit:** 100 requests per 15 minutes per IP
- **Purpose:** Basic DoS protection

---

## CSRF Protection

- **Approach:** Double-submit cookie pattern
- **When applied:** Only on routes that rely on cookie-based authentication (the `/api/auth/refresh` endpoint)
- **Most routes don't need it** because the access token is sent via the `Authorization` header, not a cookie, so a cross-origin request cannot automatically include it

---

## NoSQL Injection Protection

- All request bodies, query parameters, and URL parameters are sanitized via `express-mongo-sanitize`
- Operators like `$where`, `$gt`, `$regex` are stripped and replaced with `_`
- Sanitization events are logged to the console

---

## Google OAuth

- Google OAuth is available as an alternative to password-based login
- Users created via OAuth have `emailVerified: true` automatically (Google already verified their email)
- If a user signs up with email/password first and then uses Google OAuth with the same email, the accounts are linked
- OAuth credentials (client ID/secret) are stored in environment variables, never in source code

---

## Two-Factor Authentication (TOTP)

- **Library:** otplib
- **Algorithm:** TOTP (Time-based One-Time Password), compatible with Google Authenticator, Authy, etc.
- **Enrollment flow:**
  1. User requests 2FA enrollment → server generates a secret and returns a QR code
  2. User scans QR code with their authenticator app
  3. User enters a code from the app to confirm enrollment → `totpEnabled: true`
- **Login flow with 2FA:**
  1. User enters email + password → server validates password
  2. Instead of issuing full tokens, server returns a temporary 2FA-pending token (5-minute expiry)
  3. User enters TOTP code → server validates and issues full access + refresh tokens

---

## Anonymous Guest Sessions & Correlation Model

### Access Policy
In alignment with MakeMyTrip/Booking.com access models:
- **Search, Route Lookups, and Itinerary Generation** are completely public. Any guest visitor can use them without registering.
- **Saving Itineraries and Booking Trips** are gated behind the authentication system.

### Guest Correlation Cookie
- **Token Name:** `voyage_guest_id`
- **Type:** Cryptographically random UUIDv4
- **Lifetime:** 30 days
- **Storage:** Cookie (non-httpOnly, SameSite=Lax, Secure in production)
- **Role:** Serves strictly as a correlation ID. It carries no authorization weight. Guest-generated itineraries are saved in MongoDB under this `guestId`.

### Transition Flow (Claiming Itineraries)
Upon successful signup or login (including Google OAuth):
1. The frontend immediately triggers a `POST /api/auth/claim-guest-itineraries` request.
2. The server reads the current user's session and the `voyage_guest_id` cookie.
3. The server locates all matching records in the database where `guestId === voyage_guest_id`.
4. These records are reassigned to the authenticated user's `userId` and the `guestId` property is removed.
5. The transition event is written to the audit log under the new user's account.

### Generation Rate Limiting
Because itinerary generation is open to guest visitors and makes calls to paid LLM/Routing APIs, it is protected by a separate rate limiter:
- **Endpoint:** `POST /api/itineraries`
- **Key Generator:** Uses `req.guestId` rather than client IP.
- **Threshold:** Max 5 itinerary generations per hour per guest correlation session.

---

## Audit Logging

All authentication events are written to the `auditlogs` MongoDB collection:

| Event | Description |
|---|---|
| `signup` | New account created |
| `login` | Successful login |
| `login_failed` | Failed login attempt (bad password, no account, locked) |
| `logout` | User logged out |
| `token_refresh` | Refresh token used to get new access token |
| `token_reuse_detected` | Refresh token reuse (possible theft) |
| `email_verified` | Email verified |
| `password_reset_requested` | Password reset email sent |
| `password_reset_completed` | Password successfully reset |
| `2fa_enrolled` | 2FA enabled on account |
| `2fa_verified` | 2FA code verified during login |
| `account_locked` | Account locked after too many failures |
| `google_oauth_login` | Login via Google OAuth |
| `guest_itineraries_claimed` | Guest itineraries transferred to a user account after sign in |

Logs include: `userId`, `ip`, `userAgent`, `timestamp`, and event-specific `metadata`.
Logs auto-expire after **90 days** via a MongoDB TTL index.

---

## What's NOT Yet Implemented

These are deliberate scope boundaries, not oversights:

| Feature | Status | Notes |
|---|---|---|
| Device/session management UI | Not started | Allow users to see and revoke active sessions |
| IP-based anomaly detection | Not started | Alert on login from new location/device |
| Passkey/WebAuthn support | Not started | Passwordless authentication |
| Account deletion | Not started | GDPR-compliant account purge |
| Email change | Not started | With re-verification flow |
| Session invalidation on reuse | Partial | Currently rejects + logs, but doesn't nuke all sessions |
| Admin panel for audit logs | Not started | Currently only accessible via MongoDB directly |
