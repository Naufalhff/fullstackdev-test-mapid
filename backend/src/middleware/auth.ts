import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser, Role } from "../types.js";

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET wajib diisi");
  return jwtSecret;
}

export function signToken(authenticatedUser: AuthUser) {
  return jwt.sign(authenticatedUser, getJwtSecret(), { expiresIn: "8h" });
}

export function auth(request: Request, response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization ?? "";
  const bearerToken = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7)
    : "";
  if (!bearerToken) {
    response.status(401).json({ status: "error", message: "Unauthorized" });
    return;
  }
  try {
    const verifiedPayload = jwt.verify(bearerToken, getJwtSecret()) as AuthUser;
    (request as unknown as { user: AuthUser }).user = {
      id: Number(verifiedPayload.id),
      role: verifiedPayload.role,
    };
    next();
  } catch {
    response
      .status(401)
      .json({ status: "error", message: "Token tidak valid" });
  }
}

export function allowRoles(...allowedRoles: Role[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const authenticatedUser = (request as unknown as { user: AuthUser }).user;
    if (!authenticatedUser || !allowedRoles.includes(authenticatedUser.role)) {
      response.status(403).json({ status: "error", message: "Forbidden" });
      return;
    }
    next();
  };
}

export function getUser(request: Request): AuthUser {
  return (request as unknown as { user: AuthUser }).user;
}

export function checkPermission(requiredFeature: string) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const authenticatedUser = (request as unknown as { user: AuthUser }).user;
    if (!authenticatedUser) {
      response.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const { hasPermission } = await import("../modules/auth/permissions.js");
    const isAllowed = await hasPermission(
      authenticatedUser.role,
      requiredFeature,
    );
    if (!isAllowed) {
      response.status(403).json({
        status: "error",
        message: "Forbidden: butuh hak " + requiredFeature,
      });
      return;
    }
    next();
  };
}
