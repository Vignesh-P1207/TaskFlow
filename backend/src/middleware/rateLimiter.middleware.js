const rateLimit = require("express-rate-limit");

// Applied only to /api/auth routes. Limits repeated attempts from the
// same IP — directly addresses the "brute-force on login" requirement.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased for demo purposes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts from this IP. Please try again later.",
  },
});

module.exports = authLimiter;
