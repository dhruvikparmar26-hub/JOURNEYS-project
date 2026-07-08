import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { ipKeyGenerator } from 'express-rate-limit';

/**
 * Strict rate limiter for auth endpoints (login, signup)
 * Max 10 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  keyGenerator: ipKeyGenerator,
});

/**
 * Progressive slow-down for auth endpoints
 * After 5 requests in the window, add 500ms delay per additional request
 */
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5,
  delayMs: (hits) => (hits - 5) * 500, // 500ms per request after the 5th
  maxDelayMs: 5000, // Cap at 5 seconds
});

/**
 * General API rate limiter (more permissive)
 * Max 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Itinerary generation rate limiter
 * Max 5 itinerary creations per hour per guestId
 */
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.GENERATION_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Itinerary generation limit reached. You can only generate 5 itineraries per hour.',
    code: 'GENERATION_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => {
    // Limit by guestId correlation ID, fallback to IP
    return req.guestId || ipKeyGenerator(req);
  },
});
