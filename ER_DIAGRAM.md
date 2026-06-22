# TaskFlow Entity-Relationship (ER) Diagram

This document contains the Entity-Relationship (ER) diagram for the TaskFlow project, accurately reflecting the database schema defined in `schema.prisma` and generated in the SQL migrations.

## ER Diagram

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    
    User {
        String id PK "uuid()"
        String full_name
        String email "UNIQUE"
        String password_hash
        Int xp "default: 0"
        Int level "default: 1"
        DateTime created_at "default: now()"
        DateTime updated_at
    }

    Project ||--o{ Task : "contains"
    Project ||--o{ AuditLog : "tracks activity"
    
    Project {
        String id PK "uuid()"
        String user_id FK
        String name
        String description "nullable"
        ProjectStatus status "default: NOT_STARTED"
        DateTime start_date "nullable"
        DateTime end_date "nullable"
        DateTime created_at "default: now()"
        DateTime updated_at
    }

    Task {
        String id PK "uuid()"
        String project_id FK
        String name
        String description "nullable"
        TaskPriority priority "default: MEDIUM"
        TaskStatus status "default: PENDING"
        DateTime due_date "nullable"
        DateTime created_at "default: now()"
        DateTime updated_at
    }

    AuditLog {
        String id PK "uuid()"
        String project_id FK
        String action
        String details "nullable"
        DateTime created_at "default: now()"
    }
```

## Enums

- **ProjectStatus**: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- **TaskStatus**: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- **TaskPriority**: `LOW`, `MEDIUM`, `HIGH`

## Relationships
- **User -> Project (1:N)**: One User can own many Projects. Deleting a user cascades and deletes all their projects.
- **Project -> Task (1:N)**: One Project contains many Tasks. Deleting a project cascades and deletes all associated tasks.
- **Project -> AuditLog (1:N)**: One Project has many AuditLogs (Activity logs). Deleting a project cascades and deletes all associated logs.
