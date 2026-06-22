const { body, param, query } = require("express-validator");

const PROJECT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

const createProjectValidator = [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(", ")}`),
  body("startDate").optional().isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").optional().isISO8601().withMessage("endDate must be a valid date"),
];

const updateProjectValidator = [
  param("id").isUUID().withMessage("Invalid project id"),
  body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty"),
  body("status")
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(", ")}`),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
];

const idParamValidator = [param("id").isUUID().withMessage("Invalid project id")];

const listProjectsValidator = [
  query("status").optional().isIn(PROJECT_STATUSES),
  query("search").optional().trim(),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  idParamValidator,
  listProjectsValidator,
};
