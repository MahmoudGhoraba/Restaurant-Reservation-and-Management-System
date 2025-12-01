import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../data/models/order.schema';
import { Reservation, ReservationDocument } from '../../data/models/reservation.schema';
import { CreateOrderDto, UpdateOrderDto } from '../../data/dtos';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
  ) {}

  async createOrder(data: CreateOrderDto): Promise<OrderDocument> {
    let totalAmount = 0;

    const processedItems = data.items.map(item => {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      return { ...item, subTotal };
    });

    const order = new this.orderModel({
      orderNumber: await this.generateOrderNumber(),
      customer: data.customer,
      staff: data.staff,
      items: processedItems,
      totalAmount,
      orderType: data.orderType,
      reservation: data.reservation,
      table: data.table,
      specialInstructions: data.specialInstructions,
      createdBy: data.createdBy,
    });

    return order.save();
  }

  async getOrderById(orderId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('staff', 'name')
      .populate('items.menuItem', 'name price')
      .populate('reservation')
      .populate('table', 'tableNumber capacity');
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ customer: customerId })
      .populate('customer', 'name email phone')
      .populate('staff', 'name')
      .populate('items.menuItem', 'name price')
      .populate('reservation')
      .populate('table', 'tableNumber capacity')
      .sort({ createdAt: -1 });
  }

  async updateOrder(orderId: string, data: UpdateOrderDto): Promise<OrderDocument> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.specialInstructions) updateData.specialInstructions = data.specialInstructions;
    if (data.staff) updateData.staff = data.staff;

    const order = await this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    return order;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.orderModel.findByIdAndDelete(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
  }

  async getAllOrders(): Promise<OrderDocument[]> {
    return this.orderModel.find()
      .populate('customer', 'name email phone')
      .populate('staff', 'name')
      .populate('items.menuItem', 'name price')
      .populate('reservation')
      .populate('table', 'tableNumber capacity')
      .sort({ createdAt: -1 });
  }

  async getOrdersByStatus(status: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ status })
      .populate('customer', 'name email phone')
      .populate('staff', 'name')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.orderModel.countDocuments();
    const timestamp = Date.now();
    return `ORD-${timestamp}-${String(count + 1).padStart(4, '0')}`;
  }
}