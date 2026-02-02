import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { LOCATION } from "../config/constants.js";
import { getManagerFromUnifiedProfile } from "./unifiedProfileService.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRY = "7d";

export type TokenPayload = { employeeId: string; w3Id: string };

/**
 * Mock SSO: for local dev, "login" with email creates/fetches employee and returns JWT.
 * In production, replace with w3 SSO callback: validate w3 token, find/create employee, issue JWT.
 */
export async function mockSsoLogin(email: string, name: string): Promise<{ token: string; employee: { id: string; email: string; name: string } }> {
  const w3Id = `mock-w3-${email}`;
  return w3SsoLogin(w3Id, email, name);
}

/**
 * w3 SSO login: find or create Employee by w3Id, return JWT and employee.
 * Used after OIDC callback when we have w3 user id and profile (email, name).
 */
export async function w3SsoLogin(
  w3Id: string,
  email: string,
  name: string
): Promise<{ token: string; employee: { id: string; email: string; name: string } }> {
  // let employee = await prisma.employee.findUnique({ where: { w3Id } });
  // if (!employee) {
  //   employee = await prisma.employee.create({
  //     data: { w3Id, email, name, location: LOCATION },
  //   });
  // } else {
  //   // Optionally update email/name if they changed in w3 profile
  //   employee = await prisma.employee.update({
  //     where: { id: employee.id },
  //     data: { email, name },
  //   });
  // }

  let employee = await prisma.employee.findUnique({ where: { w3Id } });

if (!employee) {
  // 👇 NEW: fetch manager info only for new employees
  const managerInfo = await getManagerFromUnifiedProfile(email);

  let managerId: string | undefined;

  if (managerInfo) {
    const manager = await prisma.manager.upsert({
      where: { uid: managerInfo.managerUid },
      update: {},
      create: {
        uid: managerInfo.managerUid,
        name: managerInfo.managerName,
        bluDollars: 50,
      },
    });

    managerId = manager.id;
  }

  employee = await prisma.employee.create({
    data: {
      w3Id,
      email,
      name,
      location: LOCATION,
      managerId,
    },
  });
} else {
  // Existing employee → only sync name/email
  employee = await prisma.employee.update({
    where: { id: employee.id },
    data: { email, name },
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
