import mongoose, { Schema } from "mongoose";
import User, { IUser } from "./user.schema";

export interface IStaff extends IUser {
  position: string;
  shiftTime: string;
}

const staffSchema = new Schema<IStaff>({
  position: {
    type: String,
    required: true
  },
  shiftTime: {
    type: String,
    required: true
  },
});

const StaffModel = User.discriminator<IStaff>('Staff', staffSchema);

export default StaffModel;