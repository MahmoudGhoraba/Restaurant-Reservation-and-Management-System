import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('Roles check - user:', user);
    console.log('Required roles:', requiredRoles);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role;

    if (!userRole) {
      console.log('No user role found');
      throw new ForbiddenException('User role not found');
    }

    if (!requiredRoles.includes(userRole)) {
      console.log(`User role '${userRole}' not in allowed roles:`, requiredRoles);
      throw new ForbiddenException(`Required one of [${requiredRoles.join(', ')}], but user has role '${userRole}'`);
    }

    console.log(`Authorization successful: User role '${userRole}' is allowed`);
    return true;
  }
}

// Decorator for setting roles
export const Roles = (...roles: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, descriptor.value);
  };
};