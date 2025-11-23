import {Schema , model,Document,Types} from "mongoose";

export interface IPayment extends Document {
    order: Types.ObjectId;
    reservation?: Types.ObjectId | null ;/* Optional, for deposits------------------->*/
    amount: number;
    paymentMethod: "Cash" | "Card" | "Online";
    status: "Paid" | "Pending" | "Refunded";
    transactionId?: string;
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
        collection: "payment",
        timestamps: true,
    }
);

// 3. Add Validation (Pre-save hook)
PaymentSchema.pre<IPayment>('save', function (next) {
    if (!this.order && !this.reservation) {
        next(new Error('Payment must be linked to either an Order or a Reservation.'));
    } else {
        next();
    }
});

export const payment = model<IPayment>("payment", PaymentSchema);
export default payment;