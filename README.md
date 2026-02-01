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

**w3 SSO is integrated.** The app supports both mock login (dev) and w3 OIDC:

- **Mock login:** POST `/api/auth/login` with `email` and `name` (or use “Demo user” on the login page).
- **w3 SSO:** User clicks “Sign in with w3 SSO” → GET `/api/auth/w3/login` (redirects to w3) → w3 redirects to GET `/api/auth/w3/callback` → app finds/creates `Employee` by `w3Id`, issues JWT, redirects to frontend with token.

**Setup:**

1. Register your app in [w3 SSO Provisioner](https://w3.ibm.com/w3publisher/w3idsso/boarding) (OIDC, Authorization Code).
2. In the provisioner, set **Redirect URI** to `http://localhost:3001/api/auth/w3/callback` (must match `W3_REDIRECT_URI` in `.env` exactly).
3. In `server/.env`, set:
   - `W3_CLIENT_ID`, `W3_CLIENT_SECRET` (from provisioner)
   - `W3_AUTH_URL`, `W3_TOKEN_URL` (e.g. preprod: `https://preprod.login.w3.ibm.com/oidc/endpoint/default/authorize` and `.../token`)
   - `W3_REDIRECT_URI` = same as in provisioner
   - `CLIENT_URL` = frontend URL (e.g. `http://localhost:5173`) for redirect after login

## Cloud deployment (later)

- Set `DATABASE_URL` to MongoDB Atlas (or another hosted MongoDB).
- Run `npx prisma db push` to sync schema (MongoDB has no migrations; Prisma pushes the schema).
- Set `JWT_SECRET` and env for the Node app.
- Deploy server (e.g. Cloud Foundry, Kubernetes, serverless) and frontend (static hosting or same app serving static).

## License

Internal / company use.
