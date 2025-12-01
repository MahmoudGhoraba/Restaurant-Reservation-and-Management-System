import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument } from '../../data/models/table.schema';
import { Reservation, ReservationDocument } from '../../data/models/reservation.schema';
import { CreateTableDto, UpdateTableDto } from '../../data/dtos';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
  ) {}

  async createTable(data: CreateTableDto): Promise<TableDocument> {
    const table = new this.tableModel(data);
    return table.save();
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<TableDocument> {
    const table = await this.tableModel.findByIdAndUpdate(id, data, { new: true });
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }
    return table;
  }

  async getTable(id: string): Promise<TableDocument> {
    const table = await this.tableModel.findById(id);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }
    return table;
  }

  async getAllTables(): Promise<TableDocument[]> {
    return this.tableModel.find();
  }

  async deleteTable(id: string): Promise<void> {
    const table = await this.tableModel.findByIdAndDelete(id);
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }
  }

  // Check if table is available (no overlapping reservations)
  async checkTableAvailability(
    tableId: string,
    reservationDate: Date,
    reservationTime: string,
    duration: number = 60
  ): Promise<boolean> {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active reservations for this table on this date
    const existingReservations = await this.reservationModel.find({
      table: tableId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $in: ['Pending', 'Confirmed'] }
    });

    // Check for time conflicts
    const requestedStart = this.timeToMinutes(reservationTime);
    const requestedEnd = requestedStart + duration;

    // Return false if any reservation overlaps
    for (const reservation of existingReservations) {
      const existingStart = this.timeToMinutes(reservation.reservationTime);
      const existingEnd = existingStart + 60; // Default 60 minutes for MVP

      // Check if time ranges overlap
      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        return false; // Conflict found
      }
    }

    return true; // No conflicts
  }

  // Get all available tables for specific date, time and duration
  async getAvailableTables(
    reservationDate: Date,
    reservationTime: string,
    duration: number = 60,
    requiredCapacity?: number
  ): Promise<TableDocument[]> {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all reservations for this date
    const allReservations = await this.reservationModel.find({
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $in: ['Pending', 'Confirmed'] }
    });

    // Find tables with time conflicts
    const requestedStart = this.timeToMinutes(reservationTime);
    const requestedEnd = requestedStart + duration;
    const conflictingTableIds = new Set();

    allReservations.forEach(reservation => {
      const existingStart = this.timeToMinutes(reservation.reservationTime);
      const existingEnd = existingStart + 60; // Default 60 minutes for MVP

      // Check if time ranges overlap
      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        conflictingTableIds.add(reservation.table.toString());
      }
    });

    // Build query for available tables
    const query: any = {
      _id: { $nin: Array.from(conflictingTableIds) },
      isActive: true
    };

    if (requiredCapacity) {
      query.capacity = { $gte: requiredCapacity };
    }

    return await this.tableModel.find(query);
  }

  // Helper method: Convert time string to minutes
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
