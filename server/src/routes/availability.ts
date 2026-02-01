import { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { getAvailabilityForDateAndSlot } from "../services/availabilityService.js";
import { TIME_SLOTS } from "../config/constants.js";

export const availabilityRouter = Router();

/**
 * @openapi
 * /api/availability:
 *   get:
 *     summary: Get seat availability for a date and time slot
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date, example: "2025-02-01" }
 *       - in: query
 *         name: timeSlot
 *         required: true
 *         schema: { type: string, example: "09:00" }
 *     responses:
 *       200:
 *         description: Availability for the date and time slot
 *       400:
 *         description: Invalid date or timeSlot
 */
availabilityRouter.get(
  "/",
  query("date").isDate({ format: "YYYY-MM-DD", strictMode: true }),
  query("timeSlot").isIn([...TIME_SLOTS]),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const date = req.query.date as string;
    const timeSlot = req.query.timeSlot as string;
    const availability = await getAvailabilityForDateAndSlot(date, timeSlot);
    res.json(availability);
  }
);

/**
 * @openapi
 * /api/availability/time-slots:
 *   get:
 *     summary: List available 1-hour time slots
 *     tags: [Availability]
 *     responses:
 *       200:
 *         description: Array of time slot strings (e.g. ["08:00", "09:00", ...])
 */
availabilityRouter.get("/time-slots", (_req: Request, res: Response) => {
  res.json(TIME_SLOTS);
});
