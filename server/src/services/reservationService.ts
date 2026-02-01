import { prisma } from "../lib/prisma.js";
import { SEAT_CAPACITY } from "../config/constants.js";

const SEAT_NUMBERS = Array.from({ length: SEAT_CAPACITY }, (_, i) => i + 1);

/**
 * Get list of seat numbers already taken for a date.
 */
export async function getTakenSeatsForDate(date: string): Promise<number[]> {
  const reservations = await prisma.reservation.findMany({
    where: { date },
    select: { seatNumber: true },
  });
  return reservations.map((r) => r.seatNumber);
}

/**
 * Get count of reservations for a date (must not exceed SEAT_CAPACITY).
 */
export async function getReservationCountForDate(date: string): Promise<number> {
  return prisma.reservation.count({ where: { date } });
}

/**
 * Check if employee already has a reservation for the date (one per employee per day).
 */
export async function hasEmployeeReservationForDate(employeeId: string, date: string): Promise<boolean> {
  const existing = await prisma.reservation.findFirst({
    where: { employeeId, date },
  });
  return !!existing;
}

/**
 * Find next available seat number for date (1..100). Returns null if full.
 */
export async function findNextAvailableSeat(date: string): Promise<number | null> {
  const taken = await getTakenSeatsForDate(date);
  const available = SEAT_NUMBERS.find((n) => !taken.includes(n));
  return available ?? null;
}

/**
 * Create a reservation if business rules pass.
 * - Employee can have only one reservation per day.
 * - Total reservations for date must be < SEAT_CAPACITY.
 */
export async function createReservation(employeeId: string, date: string): Promise<
  | { success: true; reservation: { id: string; date: string; seatNumber: number } }
  | { success: false; error: string }
> {
  const [alreadyBooked, count, nextSeat] = await Promise.all([
    hasEmployeeReservationForDate(employeeId, date),
    getReservationCountForDate(date),
    findNextAvailableSeat(date),
  ]);

  if (alreadyBooked) {
    return { success: false, error: "You already have a reservation for this date" };
  }
  if (count >= SEAT_CAPACITY || nextSeat === null) {
    return { success: false, error: "No seats available for this date" };
  }

  const reservation = await prisma.reservation.create({
    data: { employeeId, date, seatNumber: nextSeat },
  });

  if (process.env.NODE_ENV === "development") {
    console.log("[Reservation created – full document as stored in MongoDB]:");
    console.log(JSON.stringify(reservation, null, 2));
  }

  return {
    success: true,
    reservation: { id: reservation.id, date: reservation.date, seatNumber: reservation.seatNumber },
  };
}

/**
 * Get reservation for employee on date, if any.
 */
export async function getEmployeeReservationForDate(employeeId: string, date: string) {
  return prisma.reservation.findFirst({
    where: { employeeId, date },
  });
}

/**
 * Get all reservations for an employee.
 */
export async function getReservationsByEmployee(employeeId: string) {
  return prisma.reservation.findMany({
    where: { employeeId },
    orderBy: { date: "asc" },
  });
}

/**
 * Cancel (delete) a reservation. Only the owning employee can cancel.
 */
export async function cancelReservation(employeeId: string, reservationId: string): Promise<boolean> {
  const deleted = await prisma.reservation.deleteMany({
    where: { id: reservationId, employeeId },
  });
  return deleted.count > 0;
}
