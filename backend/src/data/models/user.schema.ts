import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: number;
  role: 'Customer' | 'Admin' | 'Staff'; 
  createdAt: Date;
  updatedAt: Date;
}


const userSchema = new Schema(
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

   role: {
        type: String,
        enum: ['Customer', 'Admin','Staff'],
        required: true,
    },

    phone: {
      type: Number,
    }
  },
  {
    timestamps: true,
    discriminatorKey:"role"
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;