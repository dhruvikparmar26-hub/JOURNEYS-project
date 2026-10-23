# New Features — Backend Flow Documentation

This adds 6 new feature modules to the JOURNEYS backend. Same conventions as your
existing code: Express + Mongoose, Zod validation, `requireAuth` / `guestSession`
middleware, Notification creation on key events.

Install: `npm install node-cron` (everything else you already use).
Wire-up: see `SERVER_WIRING.js` for exact lines to add to `server.js`.

---

## 1. Trip Reviews & Ratings

Files: `models/Review.js`, `routes/reviews.js`

```
POST   /api/reviews                        requireAuth
GET    /api/reviews/destination/:label     public
GET    /api/reviews/mine                   requireAuth
PATCH  /api/reviews/:id                    requireAuth (owner only)
DELETE /api/reviews/:id                    requireAuth (owner only)
POST   /api/reviews/:id/helpful            requireAuth
```

**Submit review flow:**
```
POST /api/reviews
  -> requireAuth
  -> validate ratings/title/comment (Zod)
  -> find itinerary, verify it belongs to req.user
  -> upsert Review (one per user per itinerary)
  -> create Notification ("Thanks for your review")
  -> return review
```

**Public destination reviews flow:**
```
GET /api/reviews/destination/:label
  -> find public+visible reviews matching destination
  -> paginate
  -> aggregate average ratings (overall/hotel/activities/value)
  -> return reviews + summary
```

---

## 2. Wishlist / Saved Destinations

Files: `models/Wishlist.js`, `routes/wishlist.js`, `middleware/optionalAuth.js`

```
POST   /api/wishlist          optionalAuth (works for guest or logged-in)
GET    /api/wishlist          optionalAuth
PATCH  /api/wishlist/:id      optionalAuth (owner only)
DELETE /api/wishlist/:id      optionalAuth (owner only)
POST   /api/wishlist/claim    requireAuth (merges guest wishlist into account)
```

**Save destination flow:**
```
POST /api/wishlist
  -> guestSession (global, already in your app) sets req.guestId
  -> optionalAuth attaches req.user IF a valid token is present
  -> validate destination/notes/tags/priority
  -> owner = req.user (if logged in) else req.guestId
  -> create Wishlist doc
  -> return item
```

**Claim-on-login flow (mirrors your existing itinerary claim pattern):**
```
POST /api/wishlist/claim
  -> requireAuth
  -> reassign all Wishlist docs with matching guestId to req.user.id
  -> return count claimed
```
Call this right after login/signup on the frontend, same as itinerary claiming.

---

## 3. Price Alert System

Files: `models/PriceAlert.js`, `routes/priceAlerts.js`, `jobs/priceAlertChecker.js`

```
POST   /api/price-alerts       requireAuth
GET    /api/price-alerts       requireAuth
PATCH  /api/price-alerts/:id   requireAuth (owner only)
DELETE /api/price-alerts/:id   requireAuth (owner only)
```

**Create alert flow:**
```
POST /api/price-alerts
  -> requireAuth
  -> validate origin/destination/mode/thresholdAmount
  -> create PriceAlert (status = "active")
```

**Background checker flow (runs on a cron schedule, default every 6h):**
```
node-cron trigger
  -> checkAllActiveAlerts()
  -> for each active, non-expired alert:
       -> call routing service (SAME service your /api/route endpoint uses:
          major-routes.json -> RouteCache -> Google Routes API -> Haversine)
       -> update lastCheckedPrice / lastCheckedAt
       -> if currentPrice <= thresholdAmount:
            -> status = "triggered"
            -> create Notification ("Price drop!")
       -> if expiresAt passed -> status = "expired"
```
Note: `jobs/priceAlertChecker.js` imports `getRouteEstimate` from your existing
`services/routing.js`. If your routing service exports a differently-named
function, adjust that one import line to match.

---

## 4. Travel Companion / Group Trips

Files: `models/GroupTrip.js`, `routes/groupTrips.js`

```
POST   /api/group-trips/:itineraryId/enable                  requireAuth (owner)
POST   /api/group-trips/:itineraryId/invite                  requireAuth (owner/editor)
POST   /api/group-trips/:itineraryId/accept                  requireAuth (invitee)
GET    /api/group-trips/:itineraryId                          requireAuth (member)
DELETE /api/group-trips/:itineraryId/members/:memberEmail     requireAuth (owner)
```

**Enable + invite flow:**
```
POST /api/group-trips/:itineraryId/enable
  -> requireAuth -> verify itinerary ownership
  -> create GroupTrip doc, owner added as first member (role=owner, accepted)

POST /api/group-trips/:itineraryId/invite
  -> requireAuth -> caller must be owner or editor
  -> validate invitee email + role (editor/viewer)
  -> add pending member entry
  -> generate/reuse inviteToken (7-day expiry)
  -> log activity entry
  -> (hook to reuse your existing email service to send the invite link)
  -> return invite link: FRONTEND_URL/itinerary/:id?invite=TOKEN
```

**Accept invite flow:**
```
POST /api/group-trips/:itineraryId/accept
  -> requireAuth -> validate token matches group.inviteToken and not expired
  -> find pending member matching req.user.email
  -> mark accepted, attach user._id
  -> notify group owner ("X joined your group trip")
```

Roles: `owner` (full control) > `editor` (can invite + edit itinerary) >
`viewer` (read-only). Enforce editor-level itinerary edits in your existing
`PATCH /api/itineraries/:id` route by checking GroupTrip membership + role
(not included here since that route already exists in your codebase).

---

## 5. AI Travel Tips / Packing List

Files: `models/PackingList.js`, `services/packingListGenerator.js`, `routes/packingList.js`

```
GET  /api/packing-list/:itineraryId              public (same access pattern as GET itinerary)
POST /api/packing-list/:itineraryId/regenerate    public
```

**Generate flow:**
```
GET /api/packing-list/:itineraryId
  -> find itinerary
  -> check PackingList cache (one doc per itinerary) -> return if found
  -> else:
       -> derive season from itinerary.startDate
       -> derive tripType from query param or itinerary.tripType
       -> generateAIPackingList({destination, season, tripType, days})
            -> IF ANTHROPIC_API_KEY set: call Claude, parse JSON response
            -> ELSE (or on failure): generateRuleBasedPackingList()
                 (static category templates + season/trip-type modifiers)
       -> cache result in PackingList collection
       -> return categories + travelTips
```
Rule-based mode always works with zero configuration — same fallback
philosophy as your Google Maps key / routing service.

---

## 6. Trip Analytics Dashboard

Files: `routes/analytics.js`, `middleware/requireAdmin.js`

```
GET /api/analytics/me                             requireAuth
GET /api/analytics/admin/overview                 requireAuth + requireAdmin
GET /api/analytics/admin/popular-destinations      requireAuth + requireAdmin
GET /api/analytics/admin/spending-patterns         requireAuth + requireAdmin
GET /api/analytics/admin/funnel                    requireAuth + requireAdmin
```

**User stats flow:**
```
GET /api/analytics/me
  -> requireAuth
  -> count itineraries generated by user
  -> sum booking spend (Booking.totalAmount)
  -> top 5 destinations user has planned trips to
  -> count of reviews given
  -> return stats object
```

**Admin overview flow:**
```
GET /api/analytics/admin/overview
  -> requireAuth -> requireAdmin (checks req.user.role === 'admin')
  -> total users, trip requests, itineraries, bookings
  -> total revenue (sum of all Booking.totalAmount)
  -> new signups in last 30 days
  -> itineraries grouped by status (generating/generated/failed)
  -> return summary object
```

**Spending patterns flow:**
```
GET /api/analytics/admin/spending-patterns
  -> average booking amount
  -> monthly spend for last 12 months (grouped by year+month)
  -> spend by destination (joins Booking -> Itinerary via $lookup)
```

**Conversion funnel flow:**
```
GET /api/analytics/admin/funnel
  -> Trip Requests Submitted -> Itineraries Generated -> Itineraries Saved -> Bookings Made
  -> returns ordered funnel stage counts for a drop-off chart
```

Requires adding a `role` field to your `User` model (see `SERVER_WIRING.js`).

---

## Updated Big-Picture Flow (with new features)

```
Frontend
  -> /api request
  -> Express server
  -> security + cookies + guest session + rate limit
  -> route handler (existing OR new feature route)
  -> validation (Zod)
  -> auth check (requireAuth / optionalAuth / requireAdmin) if needed
  -> service/agent/model logic
  -> MongoDB / external API / routing service / Claude API (packing list)
  -> Notification created where relevant
  -> JSON response
```

New collections added to MongoDB: `Review`, `Wishlist`, `PriceAlert`,
`GroupTrip`, `PackingList` — alongside your existing `User`, `TripRequest`,
`Itinerary`, `Booking`, `Notification`, `RouteCache`, `Waitlist`, `AuditLog`.

Background job added: price alert checker (node-cron), started once
MongoDB connects, alongside your existing server startup sequence.
