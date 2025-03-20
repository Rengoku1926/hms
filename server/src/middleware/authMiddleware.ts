import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Extend Express Request to include userId
export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.userId = (decoded as any).userId;
      next();
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
