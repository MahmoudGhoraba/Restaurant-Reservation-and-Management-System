import {Schema , model,Document,Types} from "mongoose";

export interface IPayment extends Document {
    order: Types.ObjectId;
    reservation?: Types.ObjectId | null ;/* Optional, for deposits------------------->*/
    amount: number;
    paymentMethod: "Cash" | "Card" | "Online";
    status: "Paid" | "Pending" | "Refunded";
    transactionId?: string; /*External Bank API*/
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        reservation: {
            type: Schema.Types.ObjectId,
            ref: "Reservation",
            default:null ,
            required: false,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash" , "Card" , "Online"],
            default: "Cash",
            required: true,
        },
        status: {
            type: String,
            enum: ["Paid" , "Pending" , "Refunded"],
            default: "Pending",
            required: true,
        },
        transactionId: {
            type: String,
            required: false,
        },
        updatedAt: {
            type: Date,
            default : Date.now,
        },
        createdAt:{
            type:Date,
        }
    },
    {
        timestamps: true,
    }
);
export const payment = model<IPayment>("payment", PaymentSchema);
export default payment;