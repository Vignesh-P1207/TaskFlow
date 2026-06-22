const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { signToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 12;

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
    select: { id: true, fullName: true, email: true, xp: true, level: true, createdAt: true }, // never return passwordHash
  });

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({ success: true, data: { user, token } });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong — avoids leaking which emails are registered.
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.status(200).json({
    success: true,
    data: {
      user: { id: user.id, fullName: user.fullName, email: user.email, xp: user.xp, level: user.level },
      token,
    },
  });
});

// POST /api/auth/logout
// JWTs are stateless, so "logout" is handled client-side by discarding the
// token. This endpoint exists for API completeness / future token blacklisting.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
// Returns the current authenticated user based on the JWT token
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { id: user.id, fullName: user.fullName, email: user.email, xp: user.xp, level: user.level },
  });
});

const { sendResetEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  // We return success even if user doesn't exist to prevent email enumeration
  if (!user) {
    return res.status(200).json({ success: true, message: "If that email exists, a reset link was sent." });
  }

  // Create a 15-minute token
  const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  
  // Send email using Nodemailer & Ethereal
  const previewUrl = await sendResetEmail(user.email, resetToken);

  res.status(200).json({ 
    success: true, 
    message: "If that email exists, a reset link was sent.",
    previewUrl // send to frontend just so user can easily click it for this demo
  });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    throw new AppError("Invalid or expired reset token", 400);
  }
});

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
