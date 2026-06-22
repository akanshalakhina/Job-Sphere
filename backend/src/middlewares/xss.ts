import { Request, Response, NextFunction } from "express";
const { clean } = require("xss-clean/lib/xss");

export const xssClean = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = clean(req.body);
    }
    if (req.query) {
      try {
        const cleanedQuery = clean(req.query);
        for (const key of Object.keys(req.query)) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query, cleanedQuery);
      } catch (err) {
        console.error("Failed to sanitize req.query:", err);
      }
    }
    if (req.params) {
      try {
        const cleanedParams = clean(req.params);
        for (const key of Object.keys(req.params)) {
          delete (req.params as any)[key];
        }
        Object.assign(req.params, cleanedParams);
      } catch (err) {
        console.error("Failed to sanitize req.params:", err);
      }
    }
    next();
  };
};
