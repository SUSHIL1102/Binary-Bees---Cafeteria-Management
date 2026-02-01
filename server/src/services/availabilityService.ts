import { getTakenSeatsForDateAndSlot } from "./reservationService.js";
import { SEAT_CAPACITY } from "../config/constants.js";

/**
 * Get availability for a date + time slot: total seats, taken, available, taken seat numbers.
 */
export async function getAvailabilityForDateAndSlot(
  date: string,
  timeSlot: string
): Promise<{
  date: string;
  timeSlot: string;
  totalSeats: number;
  taken: number;
  available: number;
  takenSeatNumbers: number[];
}> {
  const takenSeatNumbers = await getTakenSeatsForDateAndSlot(date, timeSlot);
  const taken = takenSeatNumbers.length;
  return {
    date,
    timeSlot,
    totalSeats: SEAT_CAPACITY,
    taken,
    available: Math.max(0, SEAT_CAPACITY - taken),
    takenSeatNumbers,
  };
}
