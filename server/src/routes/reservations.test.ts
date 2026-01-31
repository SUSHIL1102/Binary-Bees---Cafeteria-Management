import request from "supertest";
import app from "../index.js";
import { prisma } from "../lib/prisma.js";
import { mockSsoLogin } from "../services/authService.js";

describe("Reservations API", () => {
  let token: string;
  const date = "2025-02-10";

  beforeAll(async () => {
    const login = await mockSsoLogin("api-res@test.com", "API Res");
    token = login.token;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { date } });
    await prisma.employee.deleteMany({ where: { email: "api-res@test.com" } });
    await prisma.$disconnect();
  });

  it("POST /api/reservations without auth returns 401", async () => {
    const res = await request(app).post("/api/reservations").send({ date }).expect(401);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/reservations with invalid date returns 400", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "not-a-date" })
      .expect(400);
    expect(res.body.errors).toBeDefined();
  });

  it("POST /api/reservations with valid date creates reservation", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date })
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.date).toBe(date);
    expect(res.body.seatNumber).toBeGreaterThanOrEqual(1);
    expect(res.body.seatNumber).toBeLessThanOrEqual(100);
  });

  it("POST /api/reservations same date again returns 400", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ date })
      .expect(400);
    expect(res.body.error).toContain("already have a reservation");
  });

  it("GET /api/reservations returns my reservations", async () => {
    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const forDate = res.body.find((r: { date: string }) => r.date === date);
    expect(forDate).toBeDefined();
  });

  it("GET /api/reservations?date= returns single date", async () => {
    const res = await request(app)
      .get(`/api/reservations?date=${date}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(1);
    if (res.body.length === 1) expect(res.body[0].date).toBe(date);
  });
});
