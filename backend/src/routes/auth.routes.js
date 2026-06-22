const express = require("express");
const { register, login, logout, me, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const validate = require("../middleware/validate.middleware");
const authLimiter = require("../middleware/rateLimiter.middleware");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

// Rate limiter applied to all auth routes — mitigates brute force attempts.
router.use(authLimiter);

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route to fetch current user data using JWT middleware
router.get("/me", authenticate, me);

module.exports = router;
