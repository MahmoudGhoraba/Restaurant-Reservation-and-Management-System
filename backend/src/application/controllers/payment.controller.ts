import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreatePaymentDto, UpdatePaymentDto } from '../../data/dtos';
import { PaymentStatus } from 'src/data/models';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto, @Request() req) {
    if (!dto.amount || !dto.paymentMethod) {
      throw new HttpException('Amount and payment method are required', HttpStatus.BAD_REQUEST);
    }

    if (!dto.order && !dto.reservation) {
      throw new HttpException('Payment must be linked to an Order or Reservation', HttpStatus.BAD_REQUEST);
    }

    dto.customer = req.user.id;
    return this.paymentService.createPayment(dto);
  }

  @Get()
  @UseGuards(AdminGuard)
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get('my-payments')
  async getPaymentsByCustomer(@Request() req) {
    return this.paymentService.getPaymentsByCustomer(req.user.id);
  }

  @Get('status/:status')
  @UseGuards(AdminGuard)
  async getPaymentsByStatus(@Param('status') status: string) {
    return this.paymentService.getPaymentsByStatus(status);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.updatePayment(id, dto);
  }

  @Put(':id/status')
  @UseGuards(AdminGuard)
  async updatePaymentStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    const allowedStatuses = ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new HttpException('Invalid status value', HttpStatus.BAD_REQUEST);
    }
    return this.paymentService.updatePayment(id, { status });
  }
}