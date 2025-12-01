import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { LinkPaymentDto } from './dto/link-payment.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const { id, items, payment, orderType, reservation, table } = createOrderDto;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException("Order must contain at least one item.");
    }

    if (!id) {
      throw new BadRequestException("User not authenticated.");
    }

    if (orderType === "DineIn" && !reservation && !table) {
      throw new BadRequestException("For dine-in orders provide reservation id or table id");
    }

    const order = await this.orderService.createOrder({
      customer: id,
      items,
      payment: payment || null,
      orderType: orderType || "Takeaway",
      reservation: reservation || null,
      table: table || null,
    });

    return {
      status: "success",
      data: order,
    };
  }

  @Get()
  async getAllOrders() {
    const orders = await this.orderService.getAllOrders();

    return {
      status: "success",
      results: orders.length,
      data: orders,
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return {
      status: "success",
      data: order,
    };
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    const order = await this.orderService.updateOrderStatus(id, updateOrderStatusDto.status);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return {
      status: "success",
      data: order,
    };
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    const deleted = await this.orderService.deleteOrder(id);

    if (!deleted) {
      throw new NotFoundException("Order not found");
    }

    return {
      status: "success",
      data: null,
    };
  }

  @Put(':id/payment')
  async linkPayment(
    @Param('id') id: string,
    @Body() linkPaymentDto: LinkPaymentDto
  ) {
    const order = await this.orderService.linkPayment(id, linkPaymentDto.paymentId);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return {
      status: "success",
      data: order,
    };
  }
}
