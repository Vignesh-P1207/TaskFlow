const prisma = require("../config/prisma");

/**
 * Creates an audit log entry for a project.
 * @param {string} projectId 
 * @param {string} action - e.g. 'PROJECT_CREATED', 'TASK_COMPLETED'
 * @param {string} details - Detailed human readable description of the action
 */
async function createAuditLog(projectId, action, details) {
  try {
    await prisma.auditLog.create({
      data: {
        projectId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error(`Failed to create audit log for project ${projectId}:`, error);
  }
}

module.exports = { createAuditLog };
