import mongoose, { Schema } from "mongoose";
import User, { IUser } from "./user.schema";

export interface IAdmin extends IUser {
  adminLevel: string;
}

const adminSchema = new Schema<IAdmin>({
  adminLevel: {
    type: String,
    enum: ['Manager Admin', 'Main Admin'],
    required: true,
  },
});

const AdminModel = User.discriminator<IAdmin>('Admin', adminSchema);

export default AdminModel;