import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateReservationDto, UpdateReservationDto } from '../../data/dtos';
import { BookingStatus } from 'src/data/models';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async createReservation(@Body() dto: CreateReservationDto, @Request() req) {
    dto.customer = req.user.id;
    return this.reservationService.createReservation(dto);
  }

  @Get()
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  @Get('my-reservations')
  async getMyReservations(@Request() req) {
    return this.reservationService.getReservationsByCustomer(req.user.id);
  }

  @Get(':id')
  async getReservationById(@Param('id') id: string) {
    return this.reservationService.getReservationById(id);
  }

  @Put(':id')
  async updateReservation(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationService.updateReservation(id, dto);
  }

  @Patch(':id/confirm')
  @UseGuards(AdminGuard)
  async confirmReservation(@Param('id') id: string) {
    const reservation = await this.reservationService.updateReservation(id, { bookingStatus: BookingStatus.CONFIRMED });
    return reservation;
  }

  @Patch(':id/cancel')
  async cancelReservation(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'Admin') {
      return this.reservationService.cancelReservation(id);
    }
    // For customers, we'd need additional logic to check ownership
    return this.reservationService.cancelReservation(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteReservation(@Param('id') id: string) {
    await this.reservationService.cancelReservation(id);
  }
}
