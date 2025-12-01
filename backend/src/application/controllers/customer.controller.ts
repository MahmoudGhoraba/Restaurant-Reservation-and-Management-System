import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateOrderDto, CreateFeedbackDto } from '../../data/dtos';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('menu')
  async browseMenu() {
    return this.customerService.browseMenu();
  }

  @Post('orders')
  async placeOrder(@Body() dto: CreateOrderDto, @Request() req) {
    dto.customer = req.user.id;
    return this.customerService.placeOrder(dto);
  }

  @Get('orders/:orderId')
  async trackOrder(@Param('orderId') orderId: string) {
    return this.customerService.trackOrder(orderId);
  }

  @Post('feedback')
  async giveFeedback(@Body() dto: CreateFeedbackDto, @Request() req) {
    dto.customer = req.user.id;
    return this.customerService.giveFeedback(dto);
  }

  @Get('orders')
  async getOrderHistory(@Request() req) {
    return this.customerService.getOrderHistory(req.user.id);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.customerService.getCustomerProfile(req.user.id);
  }

  @Get('reservations')
  async getReservations(@Request() req) {
    return this.customerService.getCustomerReservations(req.user.id);
  }

  @Get('feedback')
  async getFeedback(@Request() req) {
    return this.customerService.getCustomerFeedback(req.user.id);
  }
}
