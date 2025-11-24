import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReservation extends Document {
    customer: Types.ObjectId;
    table: Types.ObjectId;  // ← Add this field
    reservationDate: Date;
    reservationTime: string;
    duration: number; // ← Add duration in minutes
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
    table: {  // ← Add this field
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    reservationTime: {
        type: String,
        required: true,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
    },
    duration: {
        type: Number,
        required: true,
        min: 30, // Minimum 30 minutes
        max: 480, // Maximum 8 hours
        default: 60 // Default 1 hour
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
