const express = require("express");
const {
  getProjects,
  getProjectById,
  getProjectLogs,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const {
  createProjectValidator,
  updateProjectValidator,
  idParamValidator,
  listProjectsValidator,
} = require("../validators/project.validator");
const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

// Every route below requires a valid JWT.
router.use(authenticate);

router.get("/", listProjectsValidator, validate, getProjects);
router.get("/:id", idParamValidator, validate, getProjectById);
router.get("/:id/logs", idParamValidator, validate, getProjectLogs);
router.post("/", createProjectValidator, validate, createProject);
router.put("/:id", updateProjectValidator, validate, updateProject);
router.delete("/:id", idParamValidator, validate, deleteProject);

module.exports = router;
