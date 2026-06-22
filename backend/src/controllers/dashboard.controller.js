const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: "COMPLETED" } }),
      prisma.task.count({ where: { project: { userId }, status: "PENDING" } }),
    ]);

  // Fetch logs for the last 365 days for the Activity Heatmap
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const logs = await prisma.auditLog.findMany({
    where: {
      project: { userId },
      createdAt: { gte: oneYearAgo },
    },
    select: { createdAt: true },
  });

  const activityMap = {};
  logs.forEach((log) => {
    const dateStr = log.createdAt.toISOString().split("T")[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
      activityMap,
    },
  });
});

module.exports = { getDashboard };
