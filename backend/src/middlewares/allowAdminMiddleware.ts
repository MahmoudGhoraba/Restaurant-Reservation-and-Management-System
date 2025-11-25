import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../data/models/user.schema";
import AppError from "../infrastructure/utils/appError";
export const allowAdmin = (...allowedLevels: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userFromReq: any = (req as any).user;

      if (!userFromReq) {
        return next(new AppError("You must be authenticated", 401));
      }

      if (userFromReq.role !== "Admin") {
        return next(new AppError("Access restricted to admins", 403));
      }

      // If no specific admin levels required, allow any admin
      if (!allowedLevels || allowedLevels.length === 0) {
        return next();
      }

      // Try to get adminLevel from req.user first (some auth middleware may attach it)
      let adminLevel: string | undefined = userFromReq.adminLevel;

      // If not present on req.user, fetch from DB to be safe
      if (!adminLevel && userFromReq.userId) {
        const dbUser = await User.findById(userFromReq.userId).select("adminLevel role");
        adminLevel = (dbUser as any)?.adminLevel;
      } else if (!adminLevel && userFromReq._id) {
        const dbUser = await User.findById(userFromReq._id).select("adminLevel role");
        adminLevel = (dbUser as any)?.adminLevel;
      }

      if (!adminLevel) {
        return next(new AppError("Admin level not found", 403));
      }

      if (!allowedLevels.includes(adminLevel)) {
        return next(new AppError("Insufficient admin privileges", 403));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export default allowAdmin;