import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMenuItem } from '../models/menuitem.schema';
import { IOrderDocument } from '../models/order.schema';
import { IFeedback } from '../models/feedback.schema';
import { IReservation } from '../models/reservation.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('MenuItem') private menuItemModel: Model<IMenuItem>,
    @InjectModel('Order') private orderModel: Model<IOrderDocument>,
    @InjectModel('Feedback') private feedbackModel: Model<IFeedback>,
    @InjectModel('Reservation') private reservationModel: Model<IReservation>,
  ) {}

  async browseMenu() {
    return this.menuItemModel.find({ availability: true }).exec();
  }

  async placeOrder(
    customerId: string,
    orderData: {
      items: Array<{ menuItem: string; quantity: number; specialInstructions?: string }>;
      orderType: 'Takeaway' | 'DineIn' | 'Delivery';
      paymentType: 'Cash' | 'Card' | 'Online';
      reservationId?: string;
      deliveryAddress?: string;
    }
  ) {
    const { items, orderType, paymentType, reservationId, deliveryAddress } = orderData;

    // Validate DineIn requires reservation
    if (orderType === 'DineIn' && !reservationId) {
      throw new BadRequestException('Reservation ID is required for DineIn orders');
    }

    // Fetch menu items from database to get name and price
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await this.menuItemModel.findById(item.menuItem);
      
      if (!menuItem) {
        throw new NotFoundException(`Menu item with ID ${item.menuItem} not found`);
      }

      if (!menuItem.availability) {
        throw new BadRequestException(`Menu item "${menuItem.name}" is not available`);
      }

      const subTotal = menuItem.price * item.quantity;
      totalAmount += subTotal;

      processedItems.push({
        menuItem: new Types.ObjectId(item.menuItem),
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    // Prepare order data
    const orderPayload: any = {
      customer: new Types.ObjectId(customerId),
      items: processedItems,
      totalAmount,
      orderType,
      paymentType,
    };

    // If DineIn, get table from reservation
    if (orderType === 'DineIn' && reservationId) {
      const reservation = await this.reservationModel.findById(reservationId);
      
      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.customer.toString() !== customerId) {
        throw new BadRequestException('This reservation does not belong to you');
      }

      orderPayload.reservation = new Types.ObjectId(reservationId);
      orderPayload.table = reservation.table; // Get table from reservation
    }

    if (orderType === 'Delivery' && deliveryAddress) {
      orderPayload.deliveryAddress = deliveryAddress;
    }

    const order = new this.orderModel(orderPayload);
    return order.save();
  }

  async trackOrder(orderId: string) {
    return this.orderModel
      .findById(orderId)
      .populate('items.menuItem', 'name price')
      .populate('customer', 'name')
      .exec();
  }

  async giveFeedback(customerId: string, referenceId: string, rating: number, comment: string) {
    const feedback = new this.feedbackModel({
      customer: new Types.ObjectId(customerId),
      referenceId: new Types.ObjectId(referenceId),
      rating,
      comments: comment,
    });

    return feedback.save();
  }
}
