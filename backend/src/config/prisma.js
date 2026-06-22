const { PrismaClient } = require("@prisma/client");

// Single shared instance — prevents opening a new connection pool per request.
const prisma = new PrismaClient();

module.exports = prisma;
