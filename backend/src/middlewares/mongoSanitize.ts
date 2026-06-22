import { Request, Response, NextFunction } from "express";
import { sanitize } from "express-mongo-sanitize";

export const mongoSanitizeClean = (options = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = sanitize(req.body, options);
    }
    if (req.query) {
      try {
        req.query = sanitize(req.query, options) as any;
      } catch (err) {
        console.error("Failed to mongoSanitize req.query:", err);
      }
    }
    if (req.params) {
      try {
        req.params = sanitize(req.params, options) as any;
      } catch (err) {
        console.error("Failed to mongoSanitize req.params:", err);
      }
    }
    next();
  };
};
