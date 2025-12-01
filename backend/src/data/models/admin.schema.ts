import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserSchema } from './user.schema';

export type AdminDocument = HydratedDocument<Admin>;

export enum AdminLevel {
  MANAGER = 'Manager',
  SUPER_ADMIN = 'Super Admin'
}

@Schema({ timestamps: true })
export class Admin extends User {
  @Prop({
    type: String,
    enum: Object.values(AdminLevel),
    default: AdminLevel.MANAGER
  })
  adminLevel: AdminLevel;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);