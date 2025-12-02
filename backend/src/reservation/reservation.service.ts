import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IReservation } from '../models/reservation.schema';
import { TableService } from '../table/table.service';

interface CreateReservationInput {
  customer: Types.ObjectId | string;
  table: Types.ObjectId | string;
  reservationDate: Date;
  reservationTime: string;
  duration?: number;
  numberOfGuests: number;
}

interface UpdateReservationInput {
  table?: Types.ObjectId | string;
  reservationDate?: Date;
  reservationTime?: string;
  duration?: number;
  numberOfGuests?: number;
}

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel('Reservation') private reservationModel: Model<IReservation>,
    private readonly tableService: TableService,
  ) {}

  async createReservation({
    customer,
    table,
    reservationDate,
    reservationTime,
    duration = 60,
    numberOfGuests,
  }: CreateReservationInput): Promise<IReservation> {
    // Check if table exists and has enough capacity
    const tableDoc = await this.tableService.getTable(table.toString());
    if (!tableDoc) {
      throw new NotFoundException('Table not found');
    }

    if (tableDoc.capacity < numberOfGuests) {
      throw new BadRequestException(
        `Table capacity is ${tableDoc.capacity}, but you requested for ${numberOfGuests} guests. Please choose a larger table.`
      );
    }

    const isAvailable = await this.tableService.checkTableAvailability(
      table.toString(),
      reservationDate,
      reservationTime,
      duration
    );

    if (!isAvailable) {
      throw new BadRequestException('Table is not available for the requested time slot. Please choose a different time.');
    }

    const reservation = new this.reservationModel({
      customer,
      table,
      reservationDate,
      reservationTime,
      duration,
      numberOfGuests,
    });

    return reservation.save();
  }

  async getAllReservations(): Promise<IReservation[]> {
    return this.reservationModel
      .find()
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location')
      .sort({ reservationDate: 1, reservationTime: 1 })
      .exec();
  }

  async getReservationById(reservationId: string): Promise<IReservation | null> {
    return this.reservationModel
      .findById(reservationId)
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location')
      .exec();
  }

  async getReservationsByCustomer(customerId: Types.ObjectId | string): Promise<IReservation[]> {
    return this.reservationModel
      .find({ customer: customerId })
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location')
      .sort({ reservationDate: -1 })
      .exec();
  }

  async updateReservation(
    reservationId: string,
    customerId: Types.ObjectId | string,
    updates: UpdateReservationInput
  ): Promise<IReservation | null> {
    const reservation = await this.reservationModel.findOne({
      _id: reservationId,
      customer: customerId,
    });

    if (!reservation) {
      return null;
    }

    // Check table capacity if table or numberOfGuests is being updated
    const tableToCheck = updates.table || reservation.table;
    const guestsToCheck = updates.numberOfGuests || reservation.numberOfGuests;

    const tableDoc = await this.tableService.getTable(tableToCheck.toString());
    if (!tableDoc) {
      throw new NotFoundException('Table not found');
    }

    if (tableDoc.capacity < guestsToCheck) {
      throw new BadRequestException(
        `Table capacity is ${tableDoc.capacity}, but you requested for ${guestsToCheck} guests. Please choose a larger table.`
      );
    }

    // Check table availability if table, date, time, or duration is being updated
    if (updates.table || updates.reservationDate || updates.reservationTime || updates.duration) {
      const tableToCheck = (updates.table || reservation.table).toString();
      const dateToCheck = updates.reservationDate || reservation.reservationDate;
      const timeToCheck = updates.reservationTime || reservation.reservationTime;
      const durationToCheck = updates.duration || reservation.duration;

      const isAvailable = await this.tableService.checkTableAvailability(
        tableToCheck,
        dateToCheck,
        timeToCheck,
        durationToCheck,
        reservationId // Exclude current reservation from availability check
      );

      if (!isAvailable) {
        throw new BadRequestException('Table is not available for the requested time slot. Please choose a different time.');
      }
    }

    if (updates.table) reservation.table = updates.table as Types.ObjectId;
    if (updates.reservationDate) reservation.reservationDate = updates.reservationDate;
    if (updates.reservationTime) reservation.reservationTime = updates.reservationTime;
    if (updates.duration) reservation.duration = updates.duration;
    if (updates.numberOfGuests) reservation.numberOfGuests = updates.numberOfGuests;

    return reservation.save();
  }

  async cancelReservationByCustomer(
    reservationId: string,
    customerId: Types.ObjectId | string
  ): Promise<IReservation | null> {
    const reservation = await this.reservationModel.findOne({
      _id: reservationId,
      customer: customerId,
    });

    if (!reservation) {
      return null;
    }

    reservation.bookingStatus = 'canceled';
    return reservation.save();
  }

  async cancelReservationByAdmin(reservationId: string): Promise<IReservation | null> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      return null;
    }

    reservation.bookingStatus = 'canceled';
    return reservation.save();
  }

  async confirmReservation(reservationId: string): Promise<IReservation | null> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      return null;
    }

    if (reservation.bookingStatus === 'canceled') {
      throw new BadRequestException('Cannot confirm a canceled reservation');
    }

    reservation.bookingStatus = 'confirmed';
    return reservation.save();
  }

  async deleteReservation(reservationId: string): Promise<IReservation | null> {
    return this.reservationModel.findByIdAndDelete(reservationId).exec();
  }

  async getTableReservations(tableId: string, date: Date): Promise<IReservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.reservationModel
      .find({
        table: tableId,
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        bookingStatus: { $in: ['pending', 'confirmed'] }
      })
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location')
      .sort({ reservationTime: 1 })
      .exec();
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
