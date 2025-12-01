import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: number;
  profilePicture?:string;
  otp?: {
    temp: number | null;
    expiry: Date | null;
  };
  role: 'Customer' | 'Admin' | 'Staff';
  createdAt: Date;
  updatedAt: Date;
}


export const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required:true
    },

    password: {
      type: String,
      required:true
    },

    profilePicture: {
     type: String, 
    },

   role: {
        type: String,
        enum: ['Customer', 'Admin','Staff'],
        required: true,
    },

    phone: {
      type: Number,
    },
    otp: {
        temp:{type:Number ,default:null},
        expiry: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    discriminatorKey:"role"
  }
);

export const UserSchema = userSchema;
const User = mongoose.model<IUser>("User", userSchema);
export default User;