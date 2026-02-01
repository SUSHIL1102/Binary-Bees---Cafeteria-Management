import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { mockSsoLogin } from "../services/authService.js";

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login (mock SSO for dev)
 *     description: For local dev, login with email and name. In production, use w3 SSO callback.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name]
 *             properties:
 *               email: { type: string, example: "john@company.com" }
 *               name:  { type: string, example: "John Doe" }
 *     responses:
 *       200:
 *         description: Returns JWT and employee info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 employee: { type: object, properties: { id: {}, email: {}, name: {} } }
 *       400:
 *         description: Validation error
 */
authRouter.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("name").trim().notEmpty().isLength({ min: 1, max: 200 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, name } = req.body as { email: string; name: string };
    try {
      const result = await mockSsoLogin(email, name);
      res.json(result);
    } catch (e) {
      const err = e as Error;
      const message =
        process.env.NODE_ENV === "development" && err?.message
          ? err.message
          : "Login failed";
      if (process.env.NODE_ENV === "development") {
        console.error("[auth/login]", err);
      }
      res.status(500).json({ error: message });
    }
  }
);
