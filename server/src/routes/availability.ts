import { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { getAvailabilityForDate } from "../services/availabilityService.js";

export const availabilityRouter = Router();

/**
 * @openapi
 * /api/availability:
 *   get:
 *     summary: Get seat availability for a date
 *     description: Returns total seats, taken, available, and list of taken seat numbers.
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date, example: "2025-02-01" }
 *     responses:
 *       200:
 *         description: Availability for the date
 *       400:
 *         description: Invalid date
 */
availabilityRouter.get(
  "/",
  query("date").isDate({ format: "YYYY-MM-DD", strictMode: true }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const date = req.query.date as string;
    const availability = await getAvailabilityForDate(date);
    res.json(availability);
  }
);
