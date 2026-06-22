const AppError = require("../utils/AppError");

// Single place where every error in the app ends up. Keeps controllers
// free of repetitive try/catch + res.status(...).json(...) blocks.
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}]`, err.message);

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `${err.meta?.target?.join(", ")} already in use`,
    });
  }

  // Prisma "record not found"
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }

  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const message =
    err.isOperational || statusCode < 500
      ? err.message
      : "Something went wrong. Please try again later.";

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
