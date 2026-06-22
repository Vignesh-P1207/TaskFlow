# 🚀 Render.com Backend Deployment Guide

Deploying this Node.js/Prisma backend to Render is incredibly simple. You have two options: deploying natively as a Node Web Service, or deploying using the provided Dockerfile. 

Here are the exact "operations" (commands) you need to plug into the Render dashboard.

## Option 1: Native Node.js Web Service (Recommended for Beginners)

1. Go to your Render Dashboard and click **New > Web Service**.
2. Connect your GitHub repository and select the `TaskFlow` repo.
3. Configure the following settings:
   - **Name**: `taskflow-backend` (or whatever you prefer)
   - **Environment**: `Node`
   - **Root Directory**: `backend` (⚠️ *CRITICAL: Don't leave this blank!*)
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`

4. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL`: *(Your Render PostgreSQL Internal Database URL, or a Supabase connection string)*
   - `JWT_SECRET`: *(A long, random string like `my_super_secret_key_123`)*
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`

5. Click **Create Web Service**. Render will automatically install dependencies, generate the Prisma client, migrate your database tables, and start the Express server!

---

## Option 2: Docker Web Service (Recommended for Resumes)

If you want to show off your Docker skills in an interview, you can deploy using the `Dockerfile` we built!

1. Go to your Render Dashboard and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `taskflow-backend-docker`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - *(You do NOT need a Build or Start command, Render will read the Dockerfile automatically!)*

4. Scroll down to **Environment Variables** and add exactly the same variables as above (`DATABASE_URL`, `JWT_SECRET`, etc.).

5. Click **Create Web Service**. Render will build the lightweight Alpine Linux container, automatically install OpenSSL, run your Prisma migrations, and start the app securely.

---

## 🗄️ Setting up the PostgreSQL Database on Render
If you don't want to use an external database like Supabase, you can host the database directly on Render:
1. Click **New > PostgreSQL**.
2. Name it `taskflow-db`.
3. Once created, look for the **Internal Database URL** (it looks like `postgres://user:pass@host/db`).
4. Copy that URL and paste it into the `DATABASE_URL` environment variable of your Backend Web Service!
