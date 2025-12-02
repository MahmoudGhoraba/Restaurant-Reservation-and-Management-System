import { Schema, Types } from "mongoose";

export const OrderItemSchema = new Schema(
  {
    menuItem: {
      type: Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: null,
    },
  },
  {
    _id: false, // Embedded item, not a standalone document
  }
);
