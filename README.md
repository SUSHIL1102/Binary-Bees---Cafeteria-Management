# Cafeteria Seat Reservation

A full-stack cafeteria management service: employees log in (w3 SSO / mock for dev), view seat availability, and reserve one seat per day. Single location, 100 seats, 1000 employees.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, Prisma, **MongoDB**, Swagger (OpenAPI 3), JWT
- **Frontend:** React, Vite, TypeScript
- **Tests:** Jest (backend unit + API tests)

## Prerequisites

- Node.js 18+
- npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

## Quick start (localhost)

### 1. Install dependencies

```bash
cd cafeteria_seat_reservation
npm install
cd server
npm install
cd ..
cd client
npm install
cd ..
```

### 2. Backend: database and env

**MongoDB:** Prisma requires MongoDB to be run as a **replica set** (even with one node). Easiest options:

- **MongoDB Atlas** (free tier): create a cluster, get connection string, use as `DATABASE_URL`. Atlas is already a replica set.
- **Local replica set:** [Run MongoDB as a single-node replica set](https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/) (e.g. `mongod --replSet rs0` then `rs.initiate()` in the shell).

Ensure MongoDB is running, then:

```bash
cd server
cp .env.example .env
# Edit .env and set DATABASE_URL (e.g. mongodb://localhost:27017/cafeteria or your Atlas URI)
npx prisma db push
npx prisma generate
```

### 3. Run backend

```bash
cd server
npm run dev
```

Server: http://localhost:3001  
Swagger UI: http://localhost:3001/api-docs

### 4. Run frontend (new terminal)

```bash
cd client
npm run dev
```

UI: http://localhost:5173 — use any email and name to “Sign in” (mock SSO).

### 5. Run backend tests

```bash
cd server
npm run test
```

Tests use an **in-memory MongoDB replica set** (via `mongodb-memory-server`), so you don't need a real MongoDB running for tests. No extra setup required.

## Project structure

```
cafeteria_seat_reservation/
├── Jenkinsfile             # Jenkins pipeline (test + build)
├── server/                 # API
│   ├── prisma/
│   │   └── schema.prisma   # Employee, Reservation
│   └── src/
│       ├── config/        # constants, swagger
│       ├── lib/           # prisma client
│       ├── middleware/   # auth (JWT)
│       ├── routes/        # auth, reservations, availability, employees
│       ├── services/      # auth, reservation, availability
│       └── index.ts
├── client/                 # React UI
│   └── src/
│       ├── api/           # API client
│       ├── components/
│       ├── context/       # AuthContext
│       └── pages/         # Login, Dashboard
└── README.md
```

## API summary

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login (mock: email + name → JWT) |
| GET | /api/availability?date=YYYY-MM-DD | Seat availability for date |
| POST | /api/reservations | Reserve seat (body: `{ "date": "YYYY-MM-DD" }`) |
| GET | /api/reservations | My reservations (optional ?date=) |
| DELETE | /api/reservations/:id | Cancel my reservation |
| GET | /api/employees/me | Current employee profile |

Protected routes use header: `Authorization: Bearer <token>`.

## Business rules

- One reservation per employee per day.
- Maximum 100 reservations per date (seat capacity).
- Employee and reservation data stored in DB (Prisma + MongoDB). Easy to inspect collections in MongoDB Compass or Atlas.

## w3 SSO (production)

Auth is built so you can plug in **w3 SSO** later:

1. Register/use w3 SSO per [w3 SSO boarding](https://w3.ibm.com/w3publisher/w3idsso/boarding).
2. Replace the mock login flow with the w3 OAuth/OIDC callback.
3. On successful w3 login, get w3 user id and profile (email, name), find or create `Employee` by `w3Id`, then issue your JWT as in `authService.mockSsoLogin`.

Local dev continues to use the mock: POST `/api/auth/login` with `email` and `name`.

## Jenkins CI

The repo includes a **Jenkinsfile** that runs: checkout → backend install & test → backend build → frontend install & build. Tests use in-memory MongoDB (no real DB on the agent). Below is the full setup so the job runs without "npm not found" or missing plugin errors.

---

### Step 1: Install the Node.js plugin

1. In Jenkins, click **Manage Jenkins** (left sidebar).
2. Click **Plugins**.
3. Open the **Available plugins** tab.
4. In the search box, type **NodeJS**.
5. Check the box for **NodeJS Plugin**.
6. Click **Install without restart** (or **Download now and install after restart**).
7. If Jenkins asks to restart, do it and log in again.

---

### Step 2: Add the Node 18 tool

1. Click **Manage Jenkins** → **Tools**.
2. Find the **NodeJS** section.
3. Click **Add NodeJS**.
4. Set:
   - **Name:** type exactly **Node 18** (the Jenkinsfile expects this name).
   - Check **Install automatically**.
   - Under **Install from nodejs.org**, choose **Node 18.x** or **Node 20.x**.
5. Click **Save** (bottom of the page).

---

### Step 3: Create the Pipeline job (if you don’t have it yet)

1. From the Jenkins home page, click **New Item**.
2. Enter a name (e.g. **cafeteria-seat-reservation**).
3. Select **Pipeline** → click **OK**.
4. Under **Pipeline**:
   - **Definition:** choose **Pipeline script from SCM**.
   - **SCM:** choose **Git**.
   - **Repository URL:**  
     `https://github.com/SUSHIL1102/Binary-Bees---Cafeteria-Management.git`
   - **Credentials:** choose your GitHub credentials (username + Personal Access Token). If missing, add them under **Manage Jenkins → Credentials**.
   - **Branch:** `*/feature/jenkins` (or `*/main` if the Jenkinsfile is on main).
   - **Script Path:** `Jenkinsfile` (leave as is).
5. Click **Save**.

---

### Step 4: Push the updated Jenkinsfile and run the job

On your machine (Windows or Mac), in the project folder:

```bash
git add Jenkinsfile README.md
git commit -m "fix: use Node.js tool in Jenkins; remove publishHTML"
git push origin feature/jenkins
```

Then in Jenkins:

1. Open your Pipeline job.
2. Click **Build Now**.
3. Click the build number (e.g. **#2**) → **Console Output** to watch the run.

The pipeline will use the **Node 18** tool so `node` and `npm` are available, and it no longer uses the HTML Publisher plugin.

---

### Optional: Test results in Jenkins

- Install the **JUnit** plugin (Manage Jenkins → Plugins → search **JUnit**). After a successful run, the job page will show **Test Result** and the trend.

## Cloud deployment (later)

- Set `DATABASE_URL` to MongoDB Atlas (or another hosted MongoDB).
- Run `npx prisma db push` to sync schema (MongoDB has no migrations; Prisma pushes the schema).
- Set `JWT_SECRET` and env for the Node app.
- Deploy server (e.g. Cloud Foundry, Kubernetes, serverless) and frontend (static hosting or same app serving static).

## License

Internal / company use.
