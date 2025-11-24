import { Request, Response, NextFunction } from "express";

const authorizationMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('req.user:', req.user);
    
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }
    
    next();
  };
};

export default authorizationMiddleware;