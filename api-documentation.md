# TaskFlow API Documentation

Base URL: `http://localhost:5000/api` (or your deployed backend URL)

All endpoints return JSON in the shape `{ "success": boolean, "data"/"message": ... }`.

## Authentication

Protected endpoints require a header:
```
Authorization: Bearer <token>
```
The token is returned by `/auth/register` or `/auth/login`. All `/projects`, `/tasks`, and `/dashboard` routes require this header.

Auth endpoints (`/auth/*`) are rate-limited: max 10 requests per 15 minutes per IP.

---

## Auth

### Register
`POST /auth/register`

Request body:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "at least 8 characters"
}
```
Success `201`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "fullName": "Jane Doe", "email": "jane@example.com", "xp": 0, "level": 1, "createdAt": "..." },
    "token": "jwt..."
  }
}
```
Errors: `400` validation failed · `409` email already in use

---

### Login
`POST /auth/login`

Request body:
```json
{ "email": "jane@example.com", "password": "..." }
```
Success `200`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "fullName": "Jane Doe", "email": "jane@example.com", "xp": 0, "level": 1 },
    "token": "jwt..."
  }
}
```
Errors: `401` invalid email or password (same message for both cases, intentionally — doesn't reveal which one is wrong)

---

### Logout
`POST /auth/logout`

No body required. Stateless — the endpoint just confirms; the client is responsible for deleting its stored token.

Success `200`: `{ "success": true, "message": "Logged out successfully" }`

---

### Get current user
`GET /auth/me` 🔒 *requires auth*

Success `200`:
```json
{ "success": true, "data": { "id": "uuid", "fullName": "...", "email": "...", "xp": 0, "level": 1 } }
```
Errors: `401` no/invalid token · `404` user not found

---

### Forgot password
`POST /auth/forgot-password`

Request body:
```json
{ "email": "jane@example.com" }
```
Always returns `200` with a generic message, whether or not the email exists (prevents revealing which emails are registered):
```json
{ "success": true, "message": "If that email exists, a reset link was sent.", "previewUrl": "..." }
```
`previewUrl` is an Ethereal test-inbox link when no real email provider is configured — for demo purposes only.

Internally: generates a JWT reset token (15-minute expiry) and emails a reset link via `nodemailer`.

---

### Reset password
`POST /auth/reset-password`

Request body:
```json
{ "token": "the reset token from the email link", "newPassword": "new password" }
```
Success `200`: `{ "success": true, "message": "Password reset successful" }`
Errors: `400` missing fields, or invalid/expired token

---

## Projects
All routes below require `Authorization: Bearer <token>` and only ever return/modify projects owned by the authenticated user.

### List projects
`GET /projects`

Query params (all optional):
| Param | Values |
|---|---|
| `status` | `NOT_STARTED` \| `IN_PROGRESS` \| `COMPLETED` |
| `search` | text — matches against project name |

Success `200`:
```json
{ "success": true, "data": [ { "id": "...", "name": "...", "status": "...", "_count": { "tasks": 3 }, ... } ] }
```

### Get project by ID
`GET /projects/:id`

Success `200`: project object including its `tasks` array.
Errors: `404` if not found or not owned by you.

### Get project activity log
`GET /projects/:id/logs`

Returns the audit trail for that project (task created/completed/deleted events), most recent first.

Success `200`:
```json
{ "success": true, "data": [ { "id": "...", "action": "TASK_COMPLETED", "details": "...", "createdAt": "..." } ] }
```

### Create project
`POST /projects`

Request body:
```json
{
  "name": "Website Redesign",
  "description": "optional",
  "status": "NOT_STARTED",
  "startDate": "2026-07-01",
  "endDate": "2026-08-01"
}
```
Only `name` is required. Success `201` with the created project.

### Update project
`PUT /projects/:id`

Body: any subset of the create fields. Success `200` with the updated project.
Errors: `404` if not found/not yours.

### Delete project
`DELETE /projects/:id`

Deletes the project and (via cascade) all its tasks and audit logs.
Success `200`: `{ "success": true, "message": "Project deleted" }`

---

## Tasks
All routes require auth. A task has no owner field of its own — ownership is checked through its parent project.

### List tasks
`GET /tasks`

Query params (all optional):
| Param | Values |
|---|---|
| `projectId` | uuid — restrict to one project |
| `status` | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` |
| `search` | text — matches against task name |

### Get task by ID
`GET /tasks/:id`

### Create task
`POST /tasks`

Request body:
```json
{
  "projectId": "uuid (required)",
  "name": "Set up CI pipeline",
  "description": "optional",
  "priority": "MEDIUM",
  "status": "PENDING",
  "dueDate": "2026-07-10"
}
```
Errors: `404` if `projectId` doesn't belong to you.

### Update task
`PUT /tasks/:id`

Body: any subset of name/description/priority/status/dueDate.

### Mark task complete
`PATCH /tasks/:id/complete`

No body. Sets status to `COMPLETED`, adds 50 XP to the user, recalculates level as `floor(xp / 100) + 1`, and writes an audit log entry.

Success `200`:
```json
{
  "success": true,
  "data": { "...task" },
  "gamification": { "xpGained": 50, "newXp": 150, "newLevel": 2, "leveledUp": true }
}
```

### Mark task pending again
`PATCH /tasks/:id/uncomplete`

No body. Sets status back to `PENDING`, deducts 50 XP (floored at 0), recalculates level, logs the action.

Success `200`:
```json
{
  "success": true,
  "data": { "...task" },
  "gamification": { "xpLost": 50, "newXp": 100, "newLevel": 1, "leveledDown": true }
}
```

### Delete task
`DELETE /tasks/:id`

---

## Dashboard

### Get stats
`GET /dashboard` 🔒 *requires auth*

Returns aggregate counts scoped to the authenticated user only.

Success `200`:
```json
{
  "success": true,
  "data": {
    "totalProjects": 4,
    "totalTasks": 17,
    "completedTasks": 9,
    "pendingTasks": 6,
    "projectsInProgress": 2
  }
}
```

---

## Error response shape
All errors follow:
```json
{ "success": false, "message": "Human-readable description" }
```
Validation errors additionally include:
```json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "A valid email is required" } ] }
```

| Status | Meaning |
|---|---|
| 400 | Validation failed / malformed request |
| 401 | Missing/invalid/expired token, or wrong login credentials |
| 404 | Resource not found (or not owned by you — same response either way) |
| 409 | Conflict (e.g. email already registered) |
| 429 | Too many requests (rate limit, auth routes only) |
| 500 | Unexpected server error (message is generic; details are logged server-side only) |
