import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateOrderDto, UpdateOrderDto } from '../../data/dtos';
import { OrderStatus } from 'src/data/models';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Request() req) {
    dto.customer = req.user.id;
    dto.createdBy = req.user.id;
    return this.orderService.createOrder(dto);
  }

  @Get()
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('my-orders')
  async getOrdersByCustomer(@Request() req) {
    return this.orderService.getOrdersByCustomer(req.user.id);
  }

  @Get('status/:status')
  @UseGuards(AdminGuard)
  async getOrdersByStatus(@Param('status') status: string) {
    return this.orderService.getOrdersByStatus(status);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateOrder(id, dto);
  }

  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    const allowedStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new HttpException('Invalid status value', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.updateOrder(id, { status });
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteOrder(@Param('id') id: string) {
    await this.orderService.deleteOrder(id);
  }
}
