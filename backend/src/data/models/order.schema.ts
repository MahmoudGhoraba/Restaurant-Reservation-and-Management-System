import mongoose, { Document, Schema, Types } from "mongoose";
import { OrderItemSchema } from "./orderItem.schema";

export interface IOrderDocument extends Document {
    customer: Types.ObjectId;
    staff?: Types.ObjectId | null;
    orderDate: Date;
    status: "Pending" | "Preparing" | "Served" | "Completed";
    totalAmount: number;
    payment?: Types.ObjectId | null;
    items: Array<{
      menuItem: Types.ObjectId;
      name: string;
      quantity: number;
      price: number;
      subTotal: number;
    }>;
  }
  

const OrderSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    staff: {
      type: Types.ObjectId,
      ref: "User",  
      default: null,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Pending", "Preparing", "Served", "Completed"],
      default: "Pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    payment: {
      type: Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    collection: "orders",
  }
);

export default mongoose.model("Order", OrderSchema);
