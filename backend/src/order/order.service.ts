import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOrderDocument } from '../models/order.schema';
import { IReservation } from '../models/reservation.schema';
import { ITable } from '../models/table.schema';

interface CreateOrderInput {
  customer: Types.ObjectId | string;
  staff?: Types.ObjectId | string | null;
  items: Array<{
    menuItem: Types.ObjectId | string;
    name: string;
    quantity: number;
    price: number;
  }>;
  payment?: Types.ObjectId | string | null;
  orderType?: "Takeaway" | "DineIn" | "Delivery";
  reservation?: Types.ObjectId | string | null;
  table?: Types.ObjectId | string | null;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private orderModel: Model<IOrderDocument>,
    @InjectModel('Reservation') private reservationModel: Model<IReservation>,
    @InjectModel('Table') private tableModel: Model<ITable>,
  ) {}

  async createOrder({
    customer,
    staff = null,
    items,
    payment = null,
    orderType = "Takeaway",
    reservation = null,
    table = null,
  }: CreateOrderInput): Promise<IOrderDocument> {
    let totalAmount = 0;

    const processedItems = items.map(item => {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      return { ...item, subTotal };
    });

    const orderPayload: any = {
      customer,
      staff,
      items: processedItems,
      totalAmount,
      payment,
      orderType,
      reservation: null,
      table: null,
    };

    if (orderType === "DineIn") {
      if (reservation) {
        const resv = await this.reservationModel.findById(reservation).populate("table");
        if (!resv) throw new NotFoundException("Reservation not found");
        orderPayload.reservation = resv._id;
        orderPayload.table = resv.table ?? null;
      } else if (table) {
        const tableDoc = await this.tableModel.findById(table);
        if (!tableDoc) throw new NotFoundException("Table not found");
        orderPayload.table = tableDoc._id;
      } else {
        throw new BadRequestException("Dine-in orders require reservation or table");
      }
    }

    const order = new this.orderModel(orderPayload);
    return order.save();
  }

  async getAllOrders(): Promise<IOrderDocument[]> {
    return this.orderModel
      .find()
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment")
      .exec();
  }

  async getOrderById(orderId: string): Promise<IOrderDocument | null> {
    return this.orderModel
      .findById(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment")
      .exec();
  }

  async updateOrderStatus(
    orderId: string,
    status: "Pending" | "Preparing" | "Served" | "Completed"
  ): Promise<IOrderDocument | null> {
    return this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment")
      .exec();
  }

  async deleteOrder(orderId: string): Promise<IOrderDocument | null> {
    return this.orderModel
      .findByIdAndDelete(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment")
      .exec();
  }

  async linkPayment(
    orderId: string,
    paymentId: Types.ObjectId | string
  ): Promise<IOrderDocument | null> {
    return this.orderModel
      .findByIdAndUpdate(orderId, { payment: paymentId }, { new: true })
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment")
      .exec();
  }
}
