import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../../data/models/reservation.schema';
import { TableService } from './table.service';
import { CreateReservationDto, UpdateReservationDto } from '../../data/dtos';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private tableService: TableService,
  ) {}

  // Create a new reservation
  async createReservation(data: CreateReservationDto): Promise<ReservationDocument> {
    // Check table availability using table service
    const isAvailable = await this.tableService.checkTableAvailability(
      data.table,
      new Date(data.reservationDate),
      data.reservationTime
    );

    if (!isAvailable) {
      throw new Error('Table is not available for the requested time slot. Please choose a different time.');
    }

    const reservation = new this.reservationModel({
      customer: data.customer,
      table: data.table,
      reservationDate: new Date(data.reservationDate),
      reservationTime: data.reservationTime,
      numberOfGuests: data.numberOfGuests,
      specialRequests: data.specialRequests,
    });

    return reservation.save();
  }

  // Get reservation by ID
  async getReservationById(reservationId: string): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findById(reservationId)
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location tableNumber');
    if (!reservation) {
      throw new Error('RESERVATION_NOT_FOUND');
    }
    return reservation;
  }

  // Get reservations by customer
  async getReservationsByCustomer(customerId: string): Promise<ReservationDocument[]> {
    return this.reservationModel.find({ customer: customerId })
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location tableNumber')
      .sort({ reservationDate: -1 });
  }

  // Update reservation
  async updateReservation(
    reservationId: string,
    updates: UpdateReservationDto
  ): Promise<ReservationDocument> {
    // If updating time-related fields, check availability
    if (updates.table || updates.reservationDate || updates.reservationTime) {
      const reservation = await this.reservationModel.findById(reservationId);
      if (!reservation) {
        throw new Error('RESERVATION_NOT_FOUND');
      }

      const tableToCheck = updates.table || reservation.table.toString();
      const dateToCheck = updates.reservationDate ? new Date(updates.reservationDate) : reservation.reservationDate;
      const timeToCheck = updates.reservationTime || reservation.reservationTime;

      // Check if the new time slot is available (excluding current reservation)
      const isAvailable = await this.tableService.checkTableAvailability(
        tableToCheck,
        dateToCheck,
        timeToCheck
      );

      if (!isAvailable) {
        throw new Error('Table is not available for the requested time slot. Please choose a different time.');
      }
    }

    const updateData: any = {};
    if (updates.table) updateData.table = updates.table;
    if (updates.reservationDate) updateData.reservationDate = new Date(updates.reservationDate);
    if (updates.reservationTime) updateData.reservationTime = updates.reservationTime;
    if (updates.numberOfGuests) updateData.numberOfGuests = updates.numberOfGuests;
    if (updates.bookingStatus) updateData.bookingStatus = updates.bookingStatus;
    if (updates.specialRequests) updateData.specialRequests = updates.specialRequests;
    if (updates.assignedStaff) updateData.assignedStaff = updates.assignedStaff;
    if (updates.order) updateData.order = updates.order;

    const updatedReservation = await this.reservationModel.findByIdAndUpdate(reservationId, updateData, { new: true });
    if (!updatedReservation) {
      throw new Error('RESERVATION_NOT_FOUND');
    }
    return updatedReservation;
  }

  // Cancel reservation
  async cancelReservation(reservationId: string): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findByIdAndUpdate(
      reservationId,
      { bookingStatus: 'Cancelled' },
      { new: true }
    );
    if (!reservation) {
      throw new Error('RESERVATION_NOT_FOUND');
    }
    return reservation;
  }

  // Get all reservations
  async getAllReservations(): Promise<ReservationDocument[]> {
    return this.reservationModel.find()
      .populate('customer', 'name email phone')
      .populate('table', 'capacity location tableNumber')
      .sort({ reservationDate: -1 });
  }
}