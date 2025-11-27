import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || 'default_secret_key';

interface JwtPayload {
  user: {
    id: string;
    role: string;
    email?: string;
  };
  [key: string]: any;
}

const authenticateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const cookie = req.cookies;
    console.log('Inside authentication middleware');

    if (!cookie) {
      res.status(401).json({ message: 'No cookies found' });
      return;
    }

    const token = cookie.token;

    if (!token) {
      res.status(405).json({ message: 'No token provided in cookie' });
      return;
    }

    if (!secretKey) {
      console.error('SECRET_KEY is not defined in environment variables');
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    jwt.verify(token, secretKey, (error: any, decoded: any) => {
      if (error) {
        console.error('JWT verification failed:', error.message);
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }

      const payload = decoded as JwtPayload;
      req.user = payload.user;
      console.log('User authenticated:', req.user);
      next();
    });
  } catch (err) {
    console.error('Unexpected error in auth middleware:', err);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export default authenticateMiddleware;