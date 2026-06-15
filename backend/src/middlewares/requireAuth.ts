import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isEnvAdminUserId } from "../lib/envAdmin";
import { isDBConnected } from "../lib/mongodb";
import { User } from "../models/User";

export const JWT_SECRET = process.env.JWT_SECRET || "job-sphere-secret-key-123456";

interface DecodedToken {
  userId: string;
  role?: string;
}

export const getRequestUserId = (req: Request): string | null => {
  if (req.headers['x-mock-user-id']) {
    return req.headers['x-mock-user-id'] as string;
  }
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      return decoded.userId || null;
    }
    return null;
  } catch {
    return null;
  }
};

export const getRequestUserRole = (req: Request): string | null => {
  if (req.headers['x-mock-user-role']) {
    return req.headers['x-mock-user-role'] as string;
  }
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      return decoded.role || null;
    }
    return null;
  } catch {
    return null;
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

export const optionalAuth = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next();
};

export const requireRole =
  (role: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const jwtRole = getRequestUserRole(req);
    if (isEnvAdminUserId(userId) && jwtRole === role) {
      next();
      return;
    }
    try {
      const user = await User.findOne({ clerkId: userId }).select("role");
      if (!user || user.role !== role) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    } catch {
      res.status(403).json({ error: "Forbidden" });
    }
  };

export const requireDbRole =
  (role: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const jwtRole = getRequestUserRole(req);
    if (isEnvAdminUserId(userId) && jwtRole === role) {
      next();
      return;
    }
    if (!isDBConnected()) {
      if (jwtRole !== role) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
      return;
    }
    try {
      const user = await User.findOne({ clerkId: userId }).select("role");
      if (!user || user.role !== role) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    } catch {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
