/**
 * System constants - single location, 100 seats per time slot, 1-hour slots
 */
export const SEAT_CAPACITY = 100;
export const LOCATION = "Bangalore";
export const RESERVATION_COST = 5;

/** 1-hour time slots from 08:00 to 17:00 (10 slots) */
export const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];
