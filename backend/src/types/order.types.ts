import { Document, Types } from "mongoose";

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface IOrder extends Document {
  customer: Types.ObjectId;
  staff?: Types.ObjectId | null;
  orderDate: Date;
  status: "Pending" | "Preparing" | "Served" | "Completed";
  totalAmount: number;
  payment?: Types.ObjectId;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderDTO {
  customerId: Types.ObjectId | string;
  staffId?: Types.ObjectId | string | null;
  items: Array<{
    menuItem: Types.ObjectId | string;
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentId?: Types.ObjectId | string | null;
}

