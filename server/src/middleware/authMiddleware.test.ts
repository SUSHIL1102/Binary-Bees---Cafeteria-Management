import { jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./auth.js";
import { verifyToken } from "../services/authService.js";

jest.mock("../services/authService.js");

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe("authMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.MockedFunction<any>;
  let statusMock: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn() as jest.MockedFunction<any>;
    statusMock = jest.fn(() => ({ json: jsonMock })) as jest.MockedFunction<any>;
    
    mockReq = { headers: {} };
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
    mockNext = jest.fn() as NextFunction;
  });

  it("should return 401 when Authorization header is missing", () => {
    mockReq.headers = {};

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Missing or invalid Authorization header",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header doesn't start with Bearer", () => {
    mockReq.headers = { authorization: "Basic token123" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Missing or invalid Authorization header",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization is empty string", () => {
    mockReq.headers = { authorization: "" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Missing or invalid Authorization header",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});