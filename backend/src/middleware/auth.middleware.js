const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

// Verifies the Bearer token and attaches the decoded user to req.user.
// Every protected route relies on req.user.id for ownership checks —
// the client never gets to supply its own userId for a data lookup.
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication token missing", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

module.exports = authenticate;
