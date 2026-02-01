# Reservation Module – Cafeteria Management Backend

This document explains **only the Reservation functionality** of the Cafeteria Management Backend. It is intended for developers who want to understand, test, or extend the reservation feature.

---

## Overview

The **Reservation module** allows an authenticated employee to:
- Reserve a seat for a specific date
- View all their reservations
- Cancel an existing reservation

All reservation APIs are **protected** and require a valid JWT token.

---

## Authentication Requirement

All reservation routes are mounted like this:

```
app.use("/reservations", authMiddleware, reservationRoutes);
```

This means:
- Every request **must include** an `Authorization` header
- Token format:

```
Authorization: Bearer <JWT_TOKEN>
```

If the token is missing or invalid, the API will return **401 Unauthorized**.

---

## Base Route

```
/reservations
```

---

## 1. Create a Reservation

### Endpoint
```
POST /reservations
```

### Request Body
```json
{
  "date": "2026-02-05",
  "seatNumber": 10
}
```

### Rules
- `date` is mandatory
- `seatNumber` is mandatory
- A user **can reserve only one seat per date**
- The same seat **cannot be booked twice for the same date**

### Success Response
```json
{
  "message": "Seat reserved",
  "reservation": {
    "id": "cml3cq3na00011pymydqqib52",
    "employeeId": "cml3b1mzo00004w7xwd3tz8ro",
    "date": "2026-02-05",
    "seatNumber": 10,
    "createdAt": "2026-02-01T06:20:10.870Z",
    "updatedAt": "2026-02-01T06:20:10.870Z"
  }
}
```

### Error Responses
- Seat already booked or user already has a reservation:
```json
{ "error": "Seat already booked or you already reserved for this date" }
```

---

## 2. Get My Reservations

### Endpoint
```
GET /reservations
```

### Description
Returns **all reservations belonging to the logged-in user**.

### Success Response
```json
[
  {
    "id": "cml3cq3na00011pymydqqib52",
    "employeeId": "cml3b1mzo00004w7xwd3tz8ro",
    "date": "2026-02-05",
    "seatNumber": 10,
    "createdAt": "2026-02-01T06:20:10.870Z",
    "updatedAt": "2026-02-01T06:20:10.870Z"
  }
]
```

---

## 3. Delete (Cancel) a Reservation

### Endpoint
```
DELETE /reservations/:id
```

### URL Parameter
- `id` → Reservation ID

### Example
```
DELETE /reservations/cml3cq3na00011pymydqqib52
```

### Rules
- Users can **delete only their own reservations**
- If the reservation ID does not exist or does not belong to the user, an error is returned

### Success Response
```json
{ "message": "Reservation cancelled" }
```

### Error Response
```json
{ "error": "Reservation not found" }
```

---

## cURL Examples

### Create Reservation
```bash
curl -X POST http://localhost:4000/reservations \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-05",
    "seatNumber": 10
  }'
```

### Get My Reservations
```bash
curl -X GET http://localhost:4000/reservations \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Delete Reservation
```bash
curl -X DELETE http://localhost:4000/reservations/<RESERVATION_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Data Storage

Reservations are stored using **Prisma ORM** with a local SQLite database.

- Database file location:
```
backend/prisma/dev.db
```

⚠️ Note: Since this is a local DB, data will persist only on your machine unless migrated to a shared database.

---

## Summary

- Reservation APIs are **JWT-protected**
- Users can **create, view, and delete** their reservations
- Seat conflicts and duplicate bookings are handled at API level
- Designed to be easily extended for capacity limits, time slots, or admin views

---

✅ This section can be directly copied into the main project README or kept as `RESERVATIONS.md`.

