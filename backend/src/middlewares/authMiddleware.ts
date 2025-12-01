import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'default_secret_key';

interface JwtPayload {
  user: {
    userId?: string;
    id?: string;
    role: string;
    email?: string;
    adminLevel?: string;
  };
  [key: string]: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      let token: string | undefined;

      // Check for token in Authorization header (Bearer token)
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Token found in Authorization header');
      }
      // Fallback to cookie-based authentication
      else if (request.cookies && request.cookies.token) {
        token = request.cookies.token;
        console.log('Token found in cookie');
      }

      if (!token) {
        throw new UnauthorizedException('No token provided. Please provide token in Authorization header (Bearer token) or cookie.');
      }

      if (!secretKey) {
        console.error('SECRET_KEY is not defined in environment variables');
        throw new ForbiddenException('Internal server error');
      }

      const payload = jwt.verify(token, secretKey) as JwtPayload;
      const userFromToken = payload.user;

      // Map userId to id for consistency
      request.user = {
        id: userFromToken.userId || userFromToken.id || '',
        role: userFromToken.role,
        email: userFromToken.email,
        ...(userFromToken.adminLevel && { adminLevel: userFromToken.adminLevel })
      };

      // Also store userId for compatibility
      request.user.userId = userFromToken.userId || userFromToken.id;

      console.log('User authenticated:', request.user);
      return true;

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw error;
    }
  }
}