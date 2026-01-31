import { getTakenSeatsForDate, getReservationCountForDate } from "./reservationService.js";
import { SEAT_CAPACITY } from "../config/constants.js";

/**
 * Get availability for a date: total seats, taken, available, and list of taken seat numbers.
 */
export async function getAvailabilityForDate(date: string): Promise<{
  date: string;
  totalSeats: number;
  taken: number;
  available: number;
  takenSeatNumbers: number[];
}> {
  const [takenSeatNumbers, taken] = await Promise.all([
    getTakenSeatsForDate(date),
    getReservationCountForDate(date),
  ]);
  return {
    date,
    totalSeats: SEAT_CAPACITY,
    taken,
    available: Math.max(0, SEAT_CAPACITY - taken),
    takenSeatNumbers,
  };
}
