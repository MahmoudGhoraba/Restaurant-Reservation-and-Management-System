import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITable } from '../../Data/models/table.schema';
import { IReservation } from '../../Data/models/reservation.schema';

@Injectable()
export class TableService {
  constructor(
    @InjectModel('Table') private tableModel: Model<ITable>,
    @InjectModel('Reservation') private reservationModel: Model<IReservation>,
  ) { }

  async createTable(details: Partial<ITable>): Promise<ITable> {
    const table = new this.tableModel(details);
    return table.save();
  }

  async updateTable(id: string, details: Partial<ITable>): Promise<ITable | null> {
    return this.tableModel.findByIdAndUpdate(id, details, { new: true }).exec();
  }

  async getTable(id: string): Promise<ITable | null> {
    return this.tableModel.findById(id).exec();
  }

  async getAllTables(): Promise<ITable[]> {
    return this.tableModel.find().exec();
  }

  async deleteTable(id: string): Promise<ITable | null> {
    return this.tableModel.findByIdAndDelete(id).exec();
  }

  async checkTableAvailability(
    tableId: string,
    reservationDate: Date,
    reservationTime: string,
    duration: number = 60,
    excludeReservationId?: string
  ): Promise<boolean> {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      table: tableId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $in: ['pending', 'confirmed'] }
    };

    // Exclude the current reservation when updating
    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }

    const existingReservations = await this.reservationModel.find(query).exec();

    const requestedStart = this.timeToMinutes(reservationTime);
    const requestedEnd = requestedStart + duration;

    for (const reservation of existingReservations) {
      const existingStart = this.timeToMinutes(reservation.reservationTime);
      const existingEnd = existingStart + reservation.duration;

      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        return false;
      }
    }

    return true;
  }

  async getAvailableTables(
    reservationDate: Date,
    reservationTime: string,
    duration: number = 60,
    requiredCapacity?: number
  ): Promise<ITable[]> {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const allReservations = await this.reservationModel.find({
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $in: ['pending', 'confirmed'] }
    }).exec();

    const requestedStart = this.timeToMinutes(reservationTime);
    const requestedEnd = requestedStart + duration;
    const conflictingTableIds = new Set<string>();

    allReservations.forEach(reservation => {
      const existingStart = this.timeToMinutes(reservation.reservationTime);
      const existingEnd = existingStart + reservation.duration;

      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        conflictingTableIds.add(reservation.table.toString());
      }
    });

    const query: any = {
      _id: { $nin: Array.from(conflictingTableIds) }
    };

    if (requiredCapacity) {
      query.capacity = { $gte: requiredCapacity };
    }

    return this.tableModel.find(query).exec();
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
