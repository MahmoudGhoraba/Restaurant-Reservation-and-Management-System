import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReservation(@Body() createReservationDto: CreateReservationDto, @CurrentUser() user: any) {
    const { table, reservationDate, reservationTime, numberOfGuests, duration } = createReservationDto;

    if (!table || !reservationDate || !reservationTime || !numberOfGuests) {
      throw new BadRequestException('Please provide table, reservationDate, reservationTime, and numberOfGuests');
    }

    const customerId = user.id;

    const reservation = await this.reservationService.createReservation({
      customer: customerId,
      table,
      reservationDate: new Date(reservationDate),
      reservationTime,
      numberOfGuests,
      duration: duration || 60,
    });

    return {
      status: 'success',
      message: 'Reservation created successfully',
      data: reservation,
    };
  }

  @Get()
  async getAllReservations() {
    const reservations = await this.reservationService.getAllReservations();

    return {
      status: 'success',
      results: reservations.length,
      data: reservations,
    };
  }

  @Get('my-reservations')
  @UseGuards(JwtAuthGuard)
  async getMyReservations(@CurrentUser() user: any) {
    const customerId = user.id;

    const reservations = await this.reservationService.getReservationsByCustomer(customerId);

    return {
      status: 'success',
      results: reservations.length,
      data: reservations,
    };
  }

  @Get(':id')
  async getReservationById(@Param('id') id: string) {
    const reservation = await this.reservationService.getReservationById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return {
      status: 'success',
      data: reservation,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() user: any
  ) {
    const customerId = user.id;

    const updates: any = {};
    if (updateReservationDto.table) updates.table = updateReservationDto.table;
    if (updateReservationDto.reservationDate) updates.reservationDate = new Date(updateReservationDto.reservationDate);
    if (updateReservationDto.reservationTime) updates.reservationTime = updateReservationDto.reservationTime;
    if (updateReservationDto.numberOfGuests) updates.numberOfGuests = updateReservationDto.numberOfGuests;
    if (updateReservationDto.duration) updates.duration = updateReservationDto.duration;

    const reservation = await this.reservationService.updateReservation(id, customerId, updates);

    if (!reservation) {
      throw new NotFoundException('Reservation not found or not authorized');
    }

    return {
      status: 'success',
      message: 'Reservation updated successfully',
      data: reservation,
    };
  }

  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelReservation(@Param('id') id: string, @CurrentUser() user: any) {
    const customerId = user.id;
    const userRole = user.role;

    let reservation;

    if (userRole === 'Admin' || userRole === 'admin') {
      reservation = await this.reservationService.cancelReservationByAdmin(id);

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      return {
        status: 'success',
        message: 'Reservation canceled by admin',
        data: reservation,
      };
    }

    reservation = await this.reservationService.cancelReservationByCustomer(id, customerId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found or unauthorized');
    }

    return {
      status: 'success',
      message: 'Reservation canceled successfully',
      data: reservation,
    };
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async confirmReservation(@Param('id') id: string) {
    const reservation = await this.reservationService.confirmReservation(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return {
      status: 'success',
      message: 'Reservation confirmed successfully',
      data: reservation,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async deleteReservation(@Param('id') id: string) {
    const deleted = await this.reservationService.deleteReservation(id);

    if (!deleted) {
      throw new NotFoundException('Reservation not found');
    }

    return {
      status: 'success',
      data: null,
    };
  }
}
