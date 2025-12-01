import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as mongoose from 'mongoose';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('You must be authenticated');
    }

    if (user.role !== 'Admin') {
      throw new ForbiddenException('Access restricted to admins');
    }

    // Check for specific admin levels if required
    const allowedLevels = this.reflector.get<string[]>('adminLevels', context.getHandler());

    // If no specific admin levels required, allow any admin
    if (!allowedLevels || allowedLevels.length === 0) {
      return true;
    }

    // Try to get adminLevel from user object first
    let adminLevel: string | undefined = user.adminLevel;

    // If not present on user, fetch from DB to be safe
    if (!adminLevel && user.id) {
      const UserModel = mongoose.model('User');
      const dbUser = await UserModel.findById(user.id).select("adminLevel role");
      adminLevel = (dbUser as any)?.adminLevel;
    }

    if (!adminLevel) {
      throw new ForbiddenException('Admin level not found');
    }

    if (!allowedLevels.includes(adminLevel)) {
      throw new ForbiddenException(`Required admin level: ${allowedLevels.join(' or ')}, but user has level: ${adminLevel}`);
    }

    return true;
  }
}

// Decorator for setting admin levels
export const AdminLevels = (...levels: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('adminLevels', levels, descriptor.value);
  };
};