import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../data/models/customer.schema';
import { MenuItem, MenuItemDocument } from '../../data/models/menuitem.schema';
import { Order, OrderDocument } from '../../data/models/order.schema';
import { Feedback, FeedbackDocument } from '../../data/models/feedback.schema';
import { MenuItemService } from './menuitem.service';
import { OrderService } from './order.service';
import { FeedbackService } from './feedback.service';
import { CreateOrderDto, CreateFeedbackDto, UpdateCustomerDto } from '../../data/dtos';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
    private menuItemService: MenuItemService,
    private orderService: OrderService,
    private feedbackService: FeedbackService,
  ) {}

  async browseMenu(): Promise<MenuItemDocument[]> {
    return this.menuItemModel.find({ isAvailable: true }).populate('createdBy', 'name');
  }

  async placeOrder(data: CreateOrderDto): Promise<OrderDocument> {
    return this.orderService.createOrder(data);
  }

  async trackOrder(orderId: string): Promise<OrderDocument> {
    return this.orderService.getOrderById(orderId);
  }

  async getOrderHistory(customerId: string): Promise<OrderDocument[]> {
    return this.orderService.getOrdersByCustomer(customerId);
  }

  async giveFeedback(data: CreateFeedbackDto): Promise<FeedbackDocument> {
    return this.feedbackService.createFeedback(data);
  }

  async getCustomerProfile(customerId: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }
    return customer;
  }

  async updateCustomerProfile(customerId: string, data: UpdateCustomerDto): Promise<CustomerDocument> {
    const customer = await this.customerModel.findByIdAndUpdate(customerId, data, { new: true });
    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }
    return customer;
  }

  async getCustomerReservations(customerId: string): Promise<any[]> {
    // This would need to be implemented with ReservationService injection
    // For now, return empty array
    return [];
  }

  async getCustomerFeedback(customerId: string): Promise<FeedbackDocument[]> {
    return this.feedbackService.getAllFeedback({ customer: customerId });
  }
}