import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOrderDocument } from '../../Data/models/order.schema';
import { IReservation } from '../../Data/models/reservation.schema';
import { ITable } from '../../Data/models/table.schema';
import { IMenuItem } from '../../Data/models/menuitem.schema';

interface CreateOrderInput {
  customer: Types.ObjectId | string;
  staff?: Types.ObjectId | string | null;
  items: Array<{
    menuItem: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  orderType: "Takeaway" | "DineIn" | "Delivery";
  paymentType: "Cash" | "Card" | "Online";
  reservationId?: string;
  deliveryAddress?: string;
  payment?: Types.ObjectId | string | null;
  reservation?: Types.ObjectId | string | null;
  table?: Types.ObjectId | string | null;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private orderModel: Model<IOrderDocument>,
    @InjectModel('Reservation') private reservationModel: Model<IReservation>,
    @InjectModel('Table') private tableModel: Model<ITable>,
    @InjectModel('MenuItem') private menuItemModel: Model<IMenuItem>,
  ) { }

  async createOrder({
    customer,
    staff = null,
    items,
    orderType,
    paymentType,
    reservationId,
    deliveryAddress,
    payment = null,
    reservation = null,
    table = null,
  }: CreateOrderInput): Promise<IOrderDocument> {
    // Validate DineIn requires reservation
    if (orderType === 'DineIn' && !reservationId && !reservation && !table) {
      throw new BadRequestException('DineIn orders require reservationId, reservation, or table');
    }

    // Fetch menu items and calculate subTotals
    const processedItems: Array<{
      menuItem: Types.ObjectId;
      quantity: number;
      subTotal: number;
      specialInstructions?: string;
    }> = [];
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
        quantity: item.quantity,
        subTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    const orderPayload: any = {
      customer,
      staff,
      items: processedItems,
      totalAmount,
      paymentType,
      payment,
      orderType,
      reservation: null,
      table: null,
    };

    if (orderType === "DineIn") {
      if (reservationId) {
        const resv = await this.reservationModel.findById(reservationId);
        if (!resv) throw new NotFoundException("Reservation not found");
        orderPayload.reservation = resv._id;
        orderPayload.table = resv.table ?? null;
      } else if (reservation) {
        const resv = await this.reservationModel.findById(reservation).populate("table");
        if (!resv) throw new NotFoundException("Reservation not found");
        orderPayload.reservation = resv._id;
        orderPayload.table = resv.table ?? null;
      } else if (table) {
        const tableDoc = await this.tableModel.findById(table);
        if (!tableDoc) throw new NotFoundException("Table not found");
        orderPayload.table = tableDoc._id;
      }
    }

    if (orderType === 'Delivery' && deliveryAddress) {
      orderPayload.deliveryAddress = deliveryAddress;
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
