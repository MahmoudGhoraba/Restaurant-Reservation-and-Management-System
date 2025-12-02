import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { CustomerService } from '../Services/customer.service';
import { PlaceOrderDto } from '../../Data/Dto/customer_dto/place-order.dto';
import { GiveFeedbackDto } from '../../Data/Dto/customer_dto/give-feedback.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get('menu')
  async browseMenu() {
    const menu = await this.customerService.browseMenu();
    return {
      status: 'success',
      results: menu.length,
      data: menu,
    };
  }

  @Post('order')
  @UseGuards(JwtAuthGuard)
  async placeOrder(@Body() placeOrderDto: PlaceOrderDto, @CurrentUser() user: any) {
    const customerId = user.userId;

    const order = await this.customerService.placeOrder(customerId, placeOrderDto);

    return {
      status: 'success',
      message: 'Order placed successfully',
      data: order,
    };
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async trackOrder(@Param('orderId') orderId: string) {
    const order = await this.customerService.trackOrder(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      status: 'success',
      data: order,
    };
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  async giveFeedback(@Body() giveFeedbackDto: GiveFeedbackDto, @CurrentUser() user: any) {
    const customerId = user.id;

    const result = await this.customerService.giveFeedback(
      customerId,
      giveFeedbackDto.referenceId,
      giveFeedbackDto.rating,
      giveFeedbackDto.comment,
    );

    return {
      status: 'success',
      data: result,
    };
  }
}
