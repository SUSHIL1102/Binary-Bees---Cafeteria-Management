import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index.js";
import { prisma } from "../lib/prisma.js";
import { LOCATION } from "../config/constants.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

describe("Reservations API", () => {
  let token: string;
  const date = "2025-02-10";
  const timeSlot = "09:00";

  beforeAll(async () => {
    // Create employee with manager so we don't call real IBM Unified Profile API
    const manager = await prisma.manager.upsert({
      where: { uid: "reservations-test-mgr" },
      update: {},
      create: { uid: "reservations-test-mgr", name: "Test Manager", bluDollars: 100 },
    });
    const employee = await prisma.employee.upsert({
      where: { w3Id: "mock-w3-api-res@test.com" },
      update: { managerId: manager.id },
      create: {
        w3Id: "mock-w3-api-res@test.com",
        email: "api-res@test.com",
        name: "API Res",
        location: LOCATION,
        managerId: manager.id,
      },
    });
    token = jwt.sign(
      { employeeId: employee.id, w3Id: employee.w3Id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { date, timeSlot } });
    await prisma.employee.deleteMany({ where: { email: "api-res@test.com" } });
    await prisma.manager.deleteMany({ where: { uid: "reservations-test-mgr" } });
    await prisma.$disconnect();
  });

  it("POST /api/reservations without auth returns 401", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({ date, timeSlot, numberOfPeople: 1 })
      .expect(401);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/reservations with invalid body returns 400", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "not-a-date", timeSlot, numberOfPeople: 1 })
      .expect(400);
    expect(res.body.errors).toBeDefined();
  });

  it("POST /api/reservations with valid body creates reservation", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date, timeSlot, numberOfPeople: 2 })
      .expect(201);
    const reservation = res.body.reservation ?? res.body;
    expect(reservation.id).toBeDefined();
    expect(reservation.date).toBe(date);
    expect(reservation.timeSlot).toBe(timeSlot);
    expect(Array.isArray(reservation.seatNumbers)).toBe(true);
    expect(reservation.seatNumbers).toHaveLength(2);
  });

  it("POST /api/reservations same date+slot again returns 400", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date, timeSlot, numberOfPeople: 1 })
      .expect(400);
    expect(res.body.error).toContain("already have a reservation");
  });

  it("GET /api/reservations returns my reservations", async () => {
    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const match = res.body.find(
      (r: { date: string; timeSlot: string }) => r.date === date && r.timeSlot === timeSlot
    );
    expect(match).toBeDefined();
  });

  it("GET /api/reservations?date=&timeSlot= returns filtered", async () => {
    const res = await request(app)
      .get(`/api/reservations?date=${date}&timeSlot=${timeSlot}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(1);
    if (res.body.length === 1) {
      expect(res.body[0].date).toBe(date);
      expect(res.body[0].timeSlot).toBe(timeSlot);
    }
  });
});
