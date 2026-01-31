import { Router, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/auth.js";
import {
  createReservation,
  getEmployeeReservationForDate,
  getReservationsByEmployee,
  cancelReservation,
} from "../services/reservationService.js";

export const reservationRouter = Router();
reservationRouter.use(authMiddleware);

/**
 * @openapi
 * /api/reservations:
 *   post:
 *     summary: Reserve a seat
 *     description: One reservation per employee per day. Fails if seats full or already reserved.
 *     tags: [Reservations]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date: { type: string, format: date, example: "2025-02-01" }
 *     responses:
 *       201:
 *         description: Reservation created
 *       400:
 *         description: Validation or business rule error
 *       401:
 *         description: Unauthorized
 */
reservationRouter.post(
  "/",
  body("date").isDate({ format: "YYYY-MM-DD", strictMode: true }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const employeeId = (req as Request & { user: { employeeId: string } }).user.employeeId;
    const { date } = req.body as { date: string };
    const result = await createReservation(employeeId, date);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(result.reservation);
  }
);

/**
 * @openapi
 * /api/reservations:
 *   get:
 *     summary: List my reservations
 *     tags: [Reservations]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Optional; if provided, returns only reservation for that date.
 *     responses:
 *       200:
 *         description: List of reservations
 *       401:
 *         description: Unauthorized
 */
reservationRouter.get(
  "/",
  query("date").optional().isDate({ format: "YYYY-MM-DD", strictMode: true }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const employeeId = (req as Request & { user: { employeeId: string } }).user.employeeId;
    const date = req.query.date as string | undefined;
    if (date) {
      const one = await getEmployeeReservationForDate(employeeId, date);
      res.json(one ? [one] : []);
      return;
    }
    const list = await getReservationsByEmployee(employeeId);
    res.json(list);
  }
);

/**
 * @openapi
 * /api/reservations/{id}:
 *   delete:
 *     summary: Cancel my reservation
 *     tags: [Reservations]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Cancelled
 *       404:
 *         description: Reservation not found or not owned
 *       401:
 *         description: Unauthorized
 */
reservationRouter.delete("/:id", param("id").notEmpty(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const employeeId = (req as Request & { user: { employeeId: string } }).user.employeeId;
  const id = req.params.id;
  const cancelled = await cancelReservation(employeeId, id);
  if (!cancelled) {
    res.status(404).json({ error: "Reservation not found or you cannot cancel it" });
    return;
  }
  res.status(204).send();
});
