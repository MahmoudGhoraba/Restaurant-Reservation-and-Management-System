import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMenuItem } from '../models/menuitem.schema';
import { IOrderDocument } from '../models/order.schema';
import { IFeedback } from '../models/feedback.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('MenuItem') private menuItemModel: Model<IMenuItem>,
    @InjectModel('Order') private orderModel: Model<IOrderDocument>,
    @InjectModel('Feedback') private feedbackModel: Model<IFeedback>,
  ) {}

  async browseMenu() {
    return this.menuItemModel.find().populate('category', 'name').exec();
  }

  async placeOrder(customerId: string, items: any[], paymentId?: string) {
    let totalAmount = 0;

    const processedItems = items.map((i) => {
      const sub = i.price * i.quantity;
      totalAmount += sub;

      return {
        menuItem: new Types.ObjectId(i.menuItem),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        subTotal: sub,
      };
    });

    const order = new this.orderModel({
      customer: new Types.ObjectId(customerId),
      items: processedItems,
      totalAmount,
      payment: paymentId ? new Types.ObjectId(paymentId) : undefined,
    });

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
