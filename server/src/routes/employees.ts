import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const employeeRouter = Router();
employeeRouter.use(authMiddleware);

/**
 * @openapi
 * /api/employees/me:
 *   get:
 *     summary: Get current employee profile
 *     tags: [Employees]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         description: Current employee details
 *       401:
 *         description: Unauthorized
 */
employeeRouter.get("/me", async (req: Request, res: Response) => {
  const { employeeId } = (req as Request & { user: { employeeId: string } }).user;
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, email: true, name: true, location: true, createdAt: true },
  });
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(employee);
});
