const { body, param, query } = require("express-validator");

const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const createTaskValidator = [
  body("projectId").isUUID().withMessage("Valid projectId is required"),
  body("name").trim().notEmpty().withMessage("Task name is required"),
  body("description").optional().trim(),
  body("priority")
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}`),
  body("status")
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
  body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid date"),
];

const updateTaskValidator = [
  param("id").isUUID().withMessage("Invalid task id"),
  body("name").optional().trim().notEmpty().withMessage("Task name cannot be empty"),
  body("priority").optional().isIn(TASK_PRIORITIES),
  body("status").optional().isIn(TASK_STATUSES),
  body("dueDate").optional().isISO8601(),
];

const idParamValidator = [param("id").isUUID().withMessage("Invalid task id")];

const listTasksValidator = [
  query("status").optional().isIn(TASK_STATUSES),
  query("priority").optional().isIn(TASK_PRIORITIES),
  query("search").optional().trim(),
  query("projectId").optional().isUUID(),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  idParamValidator,
  listTasksValidator,
};
