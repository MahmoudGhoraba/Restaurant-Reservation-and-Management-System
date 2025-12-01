import mongoose, { Schema } from "mongoose";
import User, { IUser } from "./user.schema"; 


export interface ICustomer extends IUser {
  reservationCount: number;
}

const customerSchema = new Schema<ICustomer>({
  reservationCount: {
    type: Number,
    default: 0
  }
});

const CustomerModel = User.discriminator<ICustomer>('Customer', customerSchema);

export default CustomerModel;