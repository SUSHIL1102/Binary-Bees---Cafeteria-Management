# Cafeteria Seat Reservation

A full-stack cafeteria management service: employees log in (w3 SSO / mock for dev), view seat availability, and reserve one seat per day. Single location, 100 seats, 1000 employees.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite (dev), Swagger (OpenAPI 3), JWT
- **Frontend:** React, Vite, TypeScript
- **Tests:** Jest (backend unit + API tests)

## Prerequisites

- Node.js 18+
- npm

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

```bash
cd server
cp .env.example .env
npx prisma db push
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

Tests use the same SQLite DB; they clean up after themselves. For isolated test DB, set `DATABASE_URL=file:./prisma/test.db` and run `npx prisma db push` before tests.

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
- Employee and reservation data stored in DB (Prisma + SQLite).

## w3 SSO (production)

Auth is built so you can plug in **w3 SSO** later:

1. Register/use w3 SSO per [w3 SSO boarding](https://w3.ibm.com/w3publisher/w3idsso/boarding).
2. Replace the mock login flow with the w3 OAuth/OIDC callback.
3. On successful w3 login, get w3 user id and profile (email, name), find or create `Employee` by `w3Id`, then issue your JWT as in `authService.mockSsoLogin`.

Local dev continues to use the mock: POST `/api/auth/login` with `email` and `name`.

## Cloud deployment (later)

- Set `DATABASE_URL` to a cloud DB (e.g. PostgreSQL).
- Run migrations: `npx prisma migrate deploy`.
- Set `JWT_SECRET` and env for the Node app.
- Deploy server (e.g. Cloud Foundry, Kubernetes, serverless) and frontend (static hosting or same app serving static).

## License

Internal / company use.
