import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { LOCATION } from "../config/constants.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRY = "7d";

export type TokenPayload = { employeeId: string; w3Id: string };

/**
 * Mock SSO: for local dev, "login" with email creates/fetches employee and returns JWT.
 * In production, replace with w3 SSO callback: validate w3 token, find/create employee, issue JWT.
 */
export async function mockSsoLogin(email: string, name: string): Promise<{ token: string; employee: { id: string; email: string; name: string } }> {
  const w3Id = `mock-w3-${email}`;
  let employee = await prisma.employee.findUnique({ where: { w3Id } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: { w3Id, email, name, location: LOCATION },
    });
  }
  const token = jwt.sign(
    { employeeId: employee.id, w3Id: employee.w3Id } as TokenPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
  return {
    token,
    employee: { id: employee.id, email: employee.email, name: employee.name },
  };
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  return decoded;
}
