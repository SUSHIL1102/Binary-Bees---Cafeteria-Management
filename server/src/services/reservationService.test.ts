import {
  getTakenSeatsForDate,
  getReservationCountForDate,
  hasEmployeeReservationForDate,
  findNextAvailableSeat,
  createReservation,
  getEmployeeReservationForDate,
  getReservationsByEmployee,
  cancelReservation,
} from "./reservationService.js";
import { prisma } from "../lib/prisma.js";

// Use in-memory SQLite for tests via env
const testDate = "2025-02-01";
const testDate2 = "2025-02-02";

describe("reservationService", () => {
  let employeeId1: string;
  let employeeId2: string;

  beforeAll(async () => {
    const e1 = await prisma.employee.create({
      data: { w3Id: "w3-test-1", email: "a@test.com", name: "Alice", location: "Bangalore" },
    });
    const e2 = await prisma.employee.create({
      data: { w3Id: "w3-test-2", email: "b@test.com", name: "Bob", location: "Bangalore" },
    });
    employeeId1 = e1.id;
    employeeId2 = e2.id;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.employee.deleteMany({ where: { w3Id: { startsWith: "w3-test-" } } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.reservation.deleteMany({ where: { date: { in: [testDate, testDate2] } } });
  });

  describe("getTakenSeatsForDate", () => {
    it("returns empty array when no reservations", async () => {
      const taken = await getTakenSeatsForDate(testDate);
      expect(taken).toEqual([]);
    });
    it("returns taken seat numbers for date", async () => {
      await prisma.reservation.create({
        data: { employeeId: employeeId1, date: testDate, seatNumber: 5 },
      });
      await prisma.reservation.create({
        data: { employeeId: employeeId2, date: testDate2, seatNumber: 10 },
      });
      const taken = await getTakenSeatsForDate(testDate);
      expect(taken).toContain(5);
      expect(taken).not.toContain(10);
    });
  });

  describe("getReservationCountForDate", () => {
    it("returns 0 when no reservations", async () => {
      const count = await getReservationCountForDate(testDate);
      expect(count).toBe(0);
    });
    it("returns correct count", async () => {
      await prisma.reservation.create({
        data: { employeeId: employeeId1, date: testDate, seatNumber: 1 },
      });
      await prisma.reservation.create({
        data: { employeeId: employeeId2, date: testDate, seatNumber: 2 },
      });
      const count = await getReservationCountForDate(testDate);
      expect(count).toBe(2);
    });
  });

  describe("hasEmployeeReservationForDate", () => {
    it("returns false when no reservation", async () => {
      const has = await hasEmployeeReservationForDate(employeeId1, testDate);
      expect(has).toBe(false);
    });
    it("returns true when employee has reservation", async () => {
      await prisma.reservation.create({
        data: { employeeId: employeeId1, date: testDate, seatNumber: 1 },
      });
      const has = await hasEmployeeReservationForDate(employeeId1, testDate);
      expect(has).toBe(true);
    });
  });

  describe("findNextAvailableSeat", () => {
    it("returns 1 when no reservations", async () => {
      const seat = await findNextAvailableSeat(testDate);
      expect(seat).toBe(1);
    });
    it("returns next available when some taken", async () => {
      await prisma.reservation.create({
        data: { employeeId: employeeId1, date: testDate, seatNumber: 1 },
      });
      const seat = await findNextAvailableSeat(testDate);
      expect(seat).toBe(2);
    });
  });

  describe("createReservation", () => {
    it("creates reservation when rules pass", async () => {
      const result = await createReservation(employeeId1, testDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.reservation.date).toBe(testDate);
        expect(result.reservation.seatNumber).toBe(1);
      }
    });
    it("rejects second reservation same employee same day", async () => {
      await createReservation(employeeId1, testDate);
      const result = await createReservation(employeeId1, testDate);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("already have a reservation");
    });
    it("allows same employee different day", async () => {
      const r1 = await createReservation(employeeId1, testDate);
      const r2 = await createReservation(employeeId1, testDate2);
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
    });
  });

  describe("getEmployeeReservationForDate", () => {
    it("returns null when no reservation", async () => {
      const r = await getEmployeeReservationForDate(employeeId1, testDate);
      expect(r).toBeNull();
    });
    it("returns reservation when exists", async () => {
      await createReservation(employeeId1, testDate);
      const r = await getEmployeeReservationForDate(employeeId1, testDate);
      expect(r).not.toBeNull();
      expect(r?.date).toBe(testDate);
    });
  });

  describe("getReservationsByEmployee", () => {
    it("returns all reservations for employee", async () => {
      await createReservation(employeeId1, testDate);
      await createReservation(employeeId1, testDate2);
      const list = await getReservationsByEmployee(employeeId1);
      expect(list.length).toBe(2);
    });
  });

  describe("cancelReservation", () => {
    it("deletes own reservation and returns true", async () => {
      const created = await createReservation(employeeId1, testDate);
      if (!created.success) throw new Error("create failed");
      const res = await prisma.reservation.findFirst({
        where: { employeeId: employeeId1, date: testDate },
      });
      expect(res).not.toBeNull();
      const cancelled = await cancelReservation(employeeId1, res!.id);
      expect(cancelled).toBe(true);
      const after = await getEmployeeReservationForDate(employeeId1, testDate);
      expect(after).toBeNull();
    });
    it("returns false when reservation belongs to another employee", async () => {
      const created = await createReservation(employeeId1, testDate);
      if (!created.success) throw new Error("create failed");
      const res = await prisma.reservation.findFirst({
        where: { employeeId: employeeId1, date: testDate },
      });
      expect(res).not.toBeNull();
      const cancelled = await cancelReservation(employeeId2, res!.id);
      expect(cancelled).toBe(false);
    });
  });
});
