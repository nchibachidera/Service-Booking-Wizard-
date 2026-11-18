import { rateLimit } from "express-rate-limit";

const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

function createLimiter({ windowMs, limit, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { error: message }
  });
}

// Everything under /api: a generous cap that only stops runaway scripts
export const apiLimiter = createLimiter({
  windowMs: FIVE_MINUTES,
  limit: 300,
  message: "Too many requests. Please slow down and try again shortly."
});

// Wrong passwords: 10 failures per 15 minutes. Successful sign-ins don't count.
export const loginLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many sign-in attempts. Please try again in 15 minutes."
});

// New bookings: stops one address from flooding the calendar
export const bookingLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 20,
  message: "Too many booking attempts. Please try again in a few minutes."
});

// Looking up or cancelling a booking: only failed attempts count,
// which slows down anyone guessing references and phone numbers
export const lookupLimiter = createLimiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts. Please wait 15 minutes and try again."
});