import { getAvailabilityForDateAndSlot } from "./availabilityService.js";
import { prisma } from "../lib/prisma.js";

const testDate = "2025-02-03";
const testSlot = "12:00";

describe("availabilityService", () => {
  let employeeId: string;

  beforeAll(async () => {
    const e = await prisma.employee.create({
      data: { w3Id: "w3-avail", email: "avail@test.com", name: "Avail", location: "Bangalore" },
    });
    employeeId = e.id;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.employee.deleteMany({ where: { w3Id: "w3-avail" } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.reservation.deleteMany({ where: { date: testDate, timeSlot: testSlot } });
  });

  it("returns full availability when no reservations", async () => {
    const avail = await getAvailabilityForDateAndSlot(testDate, testSlot);
    expect(avail.date).toBe(testDate);
    expect(avail.timeSlot).toBe(testSlot);
    expect(avail.totalSeats).toBe(100);
    expect(avail.taken).toBe(0);
    expect(avail.available).toBe(100);
    expect(avail.takenSeatNumbers).toEqual([]);
  });

  it("returns correct taken/available after reservations", async () => {
    await prisma.reservation.create({
      data: { employeeId, date: testDate, timeSlot: testSlot, seatNumbers: [1, 2] },
    });
    const avail = await getAvailabilityForDateAndSlot(testDate, testSlot);
    expect(avail.taken).toBe(2);
    expect(avail.available).toBe(98);
    expect(avail.takenSeatNumbers).toContain(1);
    expect(avail.takenSeatNumbers).toContain(2);
  });
});
