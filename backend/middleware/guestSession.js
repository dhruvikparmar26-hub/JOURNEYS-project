import crypto from 'crypto';

/**
 * Guest Session Middleware
 *
 * Assigns every visitor a `voyage_guest_id` cookie (UUIDv4) on their first
 * request. This is NOT an auth token — it's a correlation ID so that
 * guest-generated itineraries can be stored under a guestId in MongoDB
 * and later transferred to a real userId when/if the guest signs up.
 *
 * Runs on ALL requests, including authenticated ones. Authenticated routes
 * simply ignore req.guestId and use req.user.id instead.
 */
const COOKIE_NAME = 'voyage_guest_id';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const guestSession = (req, res, next) => {
  let guestId = req.cookies?.[COOKIE_NAME];

  if (!guestId) {
    guestId = crypto.randomUUID();

    res.cookie(COOKIE_NAME, guestId, {
      httpOnly: false,        // Readable by frontend JS (not sensitive)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: THIRTY_DAYS_MS,
      path: '/',
    });
  }

  req.guestId = guestId;
  next();
};

export default guestSession;
