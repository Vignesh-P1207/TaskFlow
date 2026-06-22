# PMS Backend — Setup

## Stack
Node.js + Express + PostgreSQL (via Prisma ORM)

## 1. Install dependencies
```bash
cd backend
npm install
```

## 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set `DATABASE_URL` to your Postgres connection string, and `JWT_SECRET` to a long random string.

## 3. Set up the database
```bash
npx prisma migrate dev --name init
```
This creates the `users`, `projects`, and `tasks` tables and generates the Prisma client.

## 4. Run the server
```bash
npm run dev      # with auto-reload
npm start        # plain
```
Server starts on `http://localhost:5000`. Check `GET /health` to confirm it's up.

## Project structure
```
src/
  config/      # Prisma client singleton
  controllers/ # business logic per resource
  middleware/  # auth, error handling, rate limiting, validation
  routes/      # route definitions per resource
  validators/  # express-validator rule sets
  utils/       # JWT helpers, AppError, asyncHandler
  app.js       # Express app + middleware pipeline
  server.js    # entry point
prisma/
  schema.prisma  # data model (User, Project, Task)
```

## Auth flow
1. `POST /api/auth/register` → creates user, returns JWT
2. `POST /api/auth/login` → returns JWT
3. Send `Authorization: Bearer <token>` on all `/api/projects` and `/api/tasks` requests
