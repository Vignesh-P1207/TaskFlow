const express = require("express");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
} = require("../controllers/task.controller");
const {
  createTaskValidator,
  updateTaskValidator,
  idParamValidator,
  listTasksValidator,
} = require("../validators/task.validator");
const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", listTasksValidator, validate, getTasks);
router.get("/:id", idParamValidator, validate, getTaskById);
router.post("/", createTaskValidator, validate, createTask);
router.put("/:id", updateTaskValidator, validate, updateTask);
router.patch("/:id/complete", idParamValidator, validate, completeTask);
router.patch("/:id/uncomplete", idParamValidator, validate, uncompleteTask);
router.delete("/:id", idParamValidator, validate, deleteTask);

module.exports = router;
