import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem } from "../../types/order.types";

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staff: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);

