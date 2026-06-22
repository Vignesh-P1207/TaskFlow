const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { createAuditLog } = require("../utils/audit");

// A task has no userId of its own — ownership flows through its project.
// This helper is the single place that enforces "does this task belong
// to a project owned by the current user".
async function findOwnedTask(taskId, userId) {
  return prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
  });
}

// (Removed checkProjectCompletion as user requested it to not auto-complete projects)

// GET /api/tasks?projectId=&status=&priority=&search=
const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, priority, search } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      project: { userId: req.user.id }, // scoped through the project relation
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, data: tasks });
});

// GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user.id);
  if (!task) throw new AppError("Task not found", 404);

  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { projectId, name, description, priority, status, dueDate } = req.body;

  // Confirm the target project actually belongs to this user before
  // letting them attach a task to it.
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.user.id },
  });
  if (!project) throw new AppError("Project not found", 404);

  const task = await prisma.task.create({
    data: {
      projectId,
      name,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  await createAuditLog(projectId, "TASK_CREATED", `Task "${name}" was created.`);

  res.status(201).json({ success: true, data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const existing = await findOwnedTask(req.params.id, req.user.id);
  if (!existing) throw new AppError("Task not found", 404);

  const { name, description, priority, status, dueDate } = req.body;

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
    },
  });

  let changes = [];
  if (name !== undefined && name !== existing.name) changes.push(`name to "${name}"`);
  if (status !== undefined && status !== existing.status) changes.push(`status to ${status}`);
  if (priority !== undefined && priority !== existing.priority) changes.push(`priority to ${priority}`);
  
  if (changes.length > 0) {
    await createAuditLog(existing.projectId, "TASK_UPDATED", `Task "${existing.name}" updated: ${changes.join(", ")}`);
  } else {
    await createAuditLog(existing.projectId, "TASK_UPDATED", `Task "${existing.name}" details were updated.`);
  }

  res.status(200).json({ success: true, data: task });
});

// PATCH-style convenience handled by updateTask via status field, but a
// dedicated endpoint reads better for "mark as completed" from the UI.
const completeTask = asyncHandler(async (req, res) => {
  const existing = await findOwnedTask(req.params.id, req.user.id);
  if (!existing) throw new AppError("Task not found", 404);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: "COMPLETED" },
  });

  // Gamification: Award XP
  const XP_REWARD = 50;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const newXp = user.xp + XP_REWARD;
  const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level
  const leveledUp = newLevel > user.level;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { xp: newXp, level: newLevel },
  });

  await createAuditLog(existing.projectId, "TASK_COMPLETED", `Task "${existing.name}" was marked as completed! (+${XP_REWARD} XP)`);

  res.status(200).json({ 
    success: true, 
    data: task, 
    gamification: { xpGained: XP_REWARD, newXp, newLevel, leveledUp } 
  });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const existing = await findOwnedTask(req.params.id, req.user.id);
  if (!existing) throw new AppError("Task not found", 404);

  await prisma.task.delete({ where: { id: req.params.id } });

  await createAuditLog(existing.projectId, "TASK_DELETED", `Task "${existing.name}" was deleted.`);

  res.status(200).json({ success: true, message: "Task deleted" });
});

// Un-complete task to deduct XP
const uncompleteTask = asyncHandler(async (req, res) => {
  const existing = await findOwnedTask(req.params.id, req.user.id);
  if (!existing) throw new AppError("Task not found", 404);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: "PENDING" },
  });

  // Gamification: Deduct XP
  const XP_PENALTY = 50;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const newXp = Math.max(0, user.xp - XP_PENALTY);
  const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level
  const leveledDown = newLevel < user.level;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { xp: newXp, level: newLevel },
  });

  await createAuditLog(existing.projectId, "TASK_UNCOMPLETED", `Task "${existing.name}" was marked as pending. (-${XP_PENALTY} XP)`);

  res.status(200).json({ 
    success: true, 
    data: task, 
    gamification: { xpLost: XP_PENALTY, newXp, newLevel, leveledDown } 
  });
});

module.exports = { getTasks, getTaskById, createTask, updateTask, completeTask, uncompleteTask, deleteTask };
