const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { createAuditLog } = require("../utils/audit");

// GET /api/projects?status=&search=
const getProjects = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const projects = await prisma.project.findMany({
    where: {
      userId: req.user.id, // scoped to the authenticated user only
      ...(status && { status }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: { status: true },
      },
    },
  });

  // Calculate completion stats for the progress bar
  const data = projects.map(p => {
    const totalTasks = p.tasks.length;
    const completedTasks = p.tasks.filter(t => t.status === "COMPLETED").length;
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    // We don't need to send the full tasks array, just the counts
    const { tasks, ...rest } = p;
    return {
      ...rest,
      totalTasks,
      completedTasks,
      percent,
    };
  });

  res.status(200).json({ success: true, data });
});

// GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { tasks: true },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.status(200).json({ success: true, data: project });
});

// GET /api/projects/:id/logs
const getProjectLogs = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const logs = await prisma.auditLog.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, data: logs });
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, startDate, endDate } = req.body;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      userId: req.user.id,
    },
  });

  await createAuditLog(project.id, "PROJECT_CREATED", `Project "${name}" was created.`);

  res.status(201).json({ success: true, data: project });
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const existing = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) {
    throw new AppError("Project not found", 404);
  }

  const { name, description, status, startDate, endDate } = req.body;

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
    },
  });

  let changes = [];
  if (name !== undefined && name !== existing.name) changes.push(`name to "${name}"`);
  if (status !== undefined && status !== existing.status) changes.push(`status to ${status}`);
  if (changes.length > 0) {
    await createAuditLog(project.id, "PROJECT_UPDATED", `Updated ${changes.join(", ")}`);
  } else {
    await createAuditLog(project.id, "PROJECT_UPDATED", "Project details were updated.");
  }

  res.status(200).json({ success: true, data: project });
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const existing = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) {
    throw new AppError("Project not found", 404);
  }

  // Deleting the project will cascade delete all audit logs and tasks.
  await prisma.project.delete({ where: { id: req.params.id } });

  res.status(200).json({ success: true, message: "Project deleted" });
});

module.exports = { getProjects, getProjectById, getProjectLogs, createProject, updateProject, deleteProject };
