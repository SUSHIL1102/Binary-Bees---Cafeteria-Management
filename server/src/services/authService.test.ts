import { mockSsoLogin, verifyToken } from "./authService.js";
import { prisma } from "../lib/prisma.js";

describe("authService", () => {
  const email = "auth-test@company.com";
  const name = "Auth Test User";

  afterAll(async () => {
    await prisma.employee.deleteMany({ where: { w3Id: { startsWith: "mock-w3-" } } });
    await prisma.$disconnect();
  });

  describe("mockSsoLogin", () => {
    it("creates employee and returns token and employee", async () => {
      const result = await mockSsoLogin(email, name);
      expect(result.token).toBeDefined();
      expect(result.employee.email).toBe(email);
      expect(result.employee.name).toBe(name);
      expect(result.employee.id).toBeDefined();
    });
    it("returns same employee on second login with same email", async () => {
      const first = await mockSsoLogin(email, name);
      const second = await mockSsoLogin(email, name);
      expect(first.employee.id).toBe(second.employee.id);
    });
  });

  describe("verifyToken", () => {
    it("decodes valid token", async () => {
      const { token } = await mockSsoLogin("verify@test.com", "Verify");
      const payload = verifyToken(token);
      expect(payload.employeeId).toBeDefined();
      expect(payload.w3Id).toBeDefined();
    });
    it("throws on invalid token", () => {
      expect(() => verifyToken("invalid")).toThrow();
    });
  });
});
