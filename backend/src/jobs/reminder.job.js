const cron = require("node-cron");
const prisma = require("../config/prisma");
const { sendDeadlineReminderEmail } = require("../utils/email");

// Run every day at 8:00 AM (server time)
// For testing purposes, we'll configure it to run every minute if NODE_ENV=development
const scheduleTime = process.env.NODE_ENV === "development" ? "* * * * *" : "0 8 * * *";

function startReminderJob() {
  console.log(`[Job] Scheduled Due Date Reminders (Cron: ${scheduleTime})`);
  
  cron.schedule(scheduleTime, async () => {
    try {
      console.log("[Job] Running Due Date Reminder Check...");
      
      const now = new Date();
      // Look for tasks due in the next 24 hours (1 day)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextDayEnd = new Date(tomorrow);
      nextDayEnd.setHours(23, 59, 59, 999);

      // 1. Check Projects due soon
      const projectsDue = await prisma.project.findMany({
        where: {
          endDate: {
            gte: now,
            lte: nextDayEnd,
          },
          status: {
            not: "COMPLETED",
          },
        },
        include: { user: true },
      });

      for (const project of projectsDue) {
        await sendDeadlineReminderEmail(
          project.user.email,
          project.name,
          "Project",
          project.endDate
        );
      }

      // 2. Check Tasks due soon
      const tasksDue = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: now,
            lte: nextDayEnd,
          },
          status: {
            not: "COMPLETED",
          },
        },
        include: { project: { include: { user: true } } },
      });

      for (const task of tasksDue) {
        // Only send if the task has a specific due date (not all tasks do)
        if (task.dueDate) {
          await sendDeadlineReminderEmail(
            task.project.user.email,
            task.name,
            "Task",
            task.dueDate
          );
        }
      }

      console.log(`[Job] Reminders sent for ${projectsDue.length} projects and ${tasksDue.length} tasks.`);
    } catch (error) {
      console.error("[Job] Error running reminder job:", error);
    }
  });
}

module.exports = { startReminderJob };
