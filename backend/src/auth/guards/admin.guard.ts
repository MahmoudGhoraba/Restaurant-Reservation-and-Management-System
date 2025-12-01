import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { ADMIN_LEVELS_KEY } from '../decorators/admin-levels.decorator';
import { IUser } from '../../models/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('You must be authenticated');
    }

    if (user.role !== 'Admin') {
      throw new ForbiddenException('Access restricted to admins');
    }

    // Check for specific admin levels if specified
    const allowedLevels = this.reflector.getAllAndOverride<string[]>(ADMIN_LEVELS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific admin levels required, allow any admin
    if (!allowedLevels || allowedLevels.length === 0) {
      return true;
    }

    // Fetch admin level from database
    let adminLevel: string | undefined = (user as any).adminLevel;

    if (!adminLevel && user.id) {
      const dbUser = await this.userModel.findById(user.id).select('adminLevel role').exec();
      adminLevel = (dbUser as any)?.adminLevel;
    }

    if (!adminLevel) {
      throw new ForbiddenException('Admin level not found');
    }

    if (!allowedLevels.includes(adminLevel)) {
      throw new ForbiddenException('Insufficient admin privileges');
    }

    return true;
  }
}
