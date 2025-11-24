import Reservation, { IReservation } from "../../data/models/reservation.schema";
import { Types, Document } from "mongoose";
import TableService from "./table.service";

interface CreateReservationInput {
  customer: Types.ObjectId | string;
  table: Types.ObjectId | string;
  reservationDate: Date;
  reservationTime: string;
  duration?: number; // Optional, defaults to 60 minutes
  numberOfGuests: number;
}

interface UpdateReservationInput {
  table?: Types.ObjectId | string;
  reservationDate?: Date;
  reservationTime?: string;
  duration?: number;
  numberOfGuests?: number;
}

class ReservationService {
  // Create a new reservation
  async createReservation({
    customer,
    table,
    reservationDate,
    reservationTime,
    duration = 60,
    numberOfGuests,
  }: CreateReservationInput): Promise<IReservation> {
    // Check table availability using table service
    const isAvailable = await TableService.checkTableAvailability(
      table.toString(),
      reservationDate,
      reservationTime,
      duration
    );

    if (!isAvailable) {
      throw new Error("Table is not available for the requested time slot. Please choose a different time.");
    }

    const reservation = new Reservation({
      customer,
      table,
      reservationDate,
      reservationTime,
      duration,
      numberOfGuests,
    });

    return reservation.save();
  }

  // Get all reservations
  async getAllReservations(): Promise<IReservation[]> {
    return Reservation.find()
      .populate("customer", "name email phone")
      .populate("table", "capacity location")
      .sort({ reservationDate: 1, reservationTime: 1 });
  }

  // Get reservation by ID
  async getReservationById(reservationId: string): Promise<IReservation | null> {
    return Reservation.findById(reservationId)
      .populate("customer", "name email phone")
      .populate("table", "capacity location");
  }

  // Get reservations by customer
  async getReservationsByCustomer(customerId: Types.ObjectId | string): Promise<IReservation[]> {
    return Reservation.find({ customer: customerId })
      .populate("customer", "name email phone")
      .populate("table", "capacity location")
      .sort({ reservationDate: -1 });
  }

  // Update reservation (customer can only update their own)
  async updateReservation(
    reservationId: string,
    customerId: Types.ObjectId | string,
    updates: UpdateReservationInput
  ): Promise<IReservation | null> {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      customer: customerId,
    });

    if (!reservation) {
      return null;
    }

    // If updating time-related fields, check availability
    if (updates.table || updates.reservationDate || updates.reservationTime || updates.duration) {
      const tableToCheck = updates.table?.toString() || reservation.table.toString();
      const dateToCheck = updates.reservationDate || reservation.reservationDate;
      const timeToCheck = updates.reservationTime || reservation.reservationTime;
      const durationToCheck = updates.duration || reservation.duration;

      // Check if the new time slot is available (excluding current reservation)
      const conflictingReservations = await Reservation.find({
        _id: { $ne: reservationId },
        table: tableToCheck,
        reservationDate: {
          $gte: new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()),
          $lt: new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate() + 1)
        },
        bookingStatus: { $in: ['pending', 'confirmed'] }
      });

      // Check for time conflicts
      const hasConflict = conflictingReservations.some(existingRes => {
        const existingStart = this.timeToMinutes(existingRes.reservationTime);
        const existingEnd = existingStart + existingRes.duration;
        const newStart = this.timeToMinutes(timeToCheck);
        const newEnd = newStart + durationToCheck;

        return (newStart < existingEnd && newEnd > existingStart);
      });
    }

    // Apply updates
    if (updates.table) reservation.table = updates.table as Types.ObjectId;
    if (updates.reservationDate) reservation.reservationDate = updates.reservationDate;
    if (updates.reservationTime) reservation.reservationTime = updates.reservationTime;
    if (updates.duration) reservation.duration = updates.duration;
    if (updates.numberOfGuests) reservation.numberOfGuests = updates.numberOfGuests;

    return reservation.save();
  }

  // Cancel reservation by customer
  async cancelReservationByCustomer(
    reservationId: string,
    customerId: Types.ObjectId | string
  ): Promise<IReservation | null> {
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
  async cancelReservationByAdmin(reservationId: string): Promise<IReservation | null> {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return null;
    }

    reservation.bookingStatus = "canceled";
    return reservation.save();
  }

  // Confirm reservation (admin only)
  async confirmReservation(reservationId: string): Promise<IReservation | null> {
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
  async deleteReservation(reservationId: string): Promise<IReservation | null> {
    return Reservation.findByIdAndDelete(reservationId);
  }

  // Get reservations by table and date
  async getTableReservations(tableId: string, date: Date): Promise<IReservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Reservation.find({
      table: tableId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $in: ['pending', 'confirmed'] }
    }).populate('customer', 'name email phone')
      .populate('table', 'capacity location')
      .sort({ reservationTime: 1 });
  }



  // Helper method: Convert time string to minutes
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

export default new ReservationService();
