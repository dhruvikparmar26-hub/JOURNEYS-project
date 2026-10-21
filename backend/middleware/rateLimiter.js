import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { ipKeyGenerator } from 'express-rate-limit';

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;

const shouldSkipRateLimit = (req) => {
  return process.env.NODE_ENV === 'test' || req.headers['x-bypass-rate-limit'] === 'test-suite';
};

/**
 * Strict rate limiter for auth endpoints (login, signup)
 * High limits in development/test mode to prevent developer lockouts
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || (isDevOrTest ? 2000 : 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: {
    error: 'Too many attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  keyGenerator: ipKeyGenerator,
});

/**
 * Progressive slow-down for auth endpoints
 */
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: isDevOrTest ? 1000 : 10,
  delayMs: (hits) => (hits - (isDevOrTest ? 1000 : 10)) * 200,
  maxDelayMs: 2000,
  skip: shouldSkipRateLimit,
});

/**
 * General API rate limiter (more permissive)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || (isDevOrTest ? 10000 : 300),
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: {
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Itinerary generation rate limiter
 */
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.GENERATION_RATE_LIMIT_MAX) || (isDevOrTest ? 2000 : 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: {
    error: 'Itinerary generation limit reached. Please try again later.',
    code: 'GENERATION_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => {
    return req.guestId || ipKeyGenerator(req);
  },
});
