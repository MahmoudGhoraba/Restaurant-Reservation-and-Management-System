import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReservation extends Document {
    customer: Types.ObjectId;
    reservationDate: Date;
    reservationTime: string;
    numberOfGuests: number;
    bookingStatus: 'pending' | 'confirmed' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    reservationTime: {
        type: String,
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'canceled'],
        default: 'pending'
    }
}, { timestamps: true });

const Reservation = mongoose.model<IReservation>("Reservation", reservationSchema);
export default Reservation;
