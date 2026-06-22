const { validationResult } = require("express-validator");

// Runs after express-validator's check() chains in each route definition.
// Collects all validation errors and returns one clean 400 response,
// instead of every controller re-implementing this check.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
