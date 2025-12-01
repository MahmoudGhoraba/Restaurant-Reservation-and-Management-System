import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || 'default_secret_key';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
      };
    }
  }
}

interface JwtPayload {
  user: {
    id: string;
    role: string;
    email?: string;
  };
}

const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided in cookie' });
    }

    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    req.user = decoded.user; // assign user to request
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export default authenticateMiddleware;
