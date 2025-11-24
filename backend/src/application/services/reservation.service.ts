import Reservation from "../../data/models/reservation.schema";
import { Types, Document } from "mongoose";

interface CreateReservationInput {
  customer: Types.ObjectId | string;
  reservationDate: Date;
  reservationTime: string;
  numberOfGuests: number;
}

interface UpdateReservationInput {
  reservationDate?: Date;
  reservationTime?: string;
  numberOfGuests?: number;
}

class ReservationService {
  // Create a new reservation
  async createReservation({
    customer,
    reservationDate,
    reservationTime,
    numberOfGuests,
  }: CreateReservationInput): Promise<Document> {
    const reservation = new Reservation({
      customer,
      reservationDate,
      reservationTime,
      numberOfGuests,
    });

    return reservation.save();
  }

  // Get all reservations
  async getAllReservations(): Promise<Document[]> {
    return Reservation.find()
      .populate("customer", "name email phone")
      .sort({ reservationDate: 1, reservationTime: 1 });
  }

  // Get reservation by ID
  async getReservationById(reservationId: string): Promise<Document | null> {
    return Reservation.findById(reservationId)
      .populate("customer", "name email phone");
  }

  // Get reservations by customer
  async getReservationsByCustomer(customerId: Types.ObjectId | string): Promise<Document[]> {
    return Reservation.find({ customer: customerId })
      .sort({ reservationDate: -1 });
  }

  // Update reservation (customer can only update their own)
  async updateReservation(
    reservationId: string,
    customerId: Types.ObjectId | string,
    updates: UpdateReservationInput
  ): Promise<Document | null> {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      customer: customerId,
    });

    if (!reservation) {
      return null;
    }

    if (updates.reservationDate) reservation.reservationDate = updates.reservationDate;
    if (updates.reservationTime) reservation.reservationTime = updates.reservationTime;
    if (updates.numberOfGuests) reservation.numberOfGuests = updates.numberOfGuests;

    return reservation.save();
  }

  // Cancel reservation by customer
  async cancelReservationByCustomer(
    reservationId: string,
    customerId: Types.ObjectId | string
  ): Promise<Document | null> {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      customer: customerId,
    });

    if (!reservation) {
      return null;
    }

    reservation.bookingStatus = "canceled";
    return reservation.save();
  }

  // Cancel reservation by admin (can cancel any reservation)
  async cancelReservationByAdmin(reservationId: string): Promise<Document | null> {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return null;
    }

    reservation.bookingStatus = "canceled";
    return reservation.save();
  }

  // Confirm reservation (admin only)
  async confirmReservation(reservationId: string): Promise<Document | null> {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return null;
    }

    if (reservation.bookingStatus === "canceled") {
      throw new Error("Cannot confirm a canceled reservation");
    }

    reservation.bookingStatus = "confirmed";
    return reservation.save();
  }

  // Delete reservation
  async deleteReservation(reservationId: string): Promise<Document | null> {
    return Reservation.findByIdAndDelete(reservationId);
  }
}

export default new ReservationService();
