import { Request, Response, NextFunction } from 'express';

// This utility is less necessary in NestJS since exception filters handle async errors automatically
// But keeping it for backward compatibility if needed in Express-style middleware
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// For NestJS controllers, use the built-in exception handling instead
export const handleAsync = (fn: Function) => {
  return (...args: any[]) => {
    const result = fn(...args);
    if (result && typeof result.catch === 'function') {
      result.catch((error: any) => {
        throw error;
      });
    }
    return result;
  };
};
