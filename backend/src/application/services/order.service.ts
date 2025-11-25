import Order from "../../data/models/order.schema";
import { Types, FilterQuery, Document } from "mongoose";
import Reservation from "../../data/models/reservation.schema";
import TableService from "./table.service";

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

class OrderService {
  async createOrder({
    customer,
    staff = null,
    items,
    payment = null,
    orderType = "Takeaway",
    reservation = null,
    table = null,
  }: CreateOrderInput): Promise<Document> {
    let totalAmount = 0;

    const processedItems = items.map(item => {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      return { ...item, subTotal };
    });

    // Prepare order payload
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

    // If dine-in and reservation provided -> validate and attach reservation.table
    if (orderType === "DineIn") {
      if (reservation) {
        const resv = await Reservation.findById(reservation).populate("table");
        if (!resv) throw new Error("RESERVATION_NOT_FOUND");
        orderPayload.reservation = resv._id;
        orderPayload.table = resv.table ?? null;
      } else if (table) {
        // Walk-in: validate table exists (you may also check availability if needed)
        const tableDoc = await TableService.getTable(table.toString());
        if (!tableDoc) throw new Error("TABLE_NOT_FOUND");
        orderPayload.table = tableDoc._id;
      } else {
        throw new Error("DINEIN_REQUIRES_RESERVATION_OR_TABLE");
      }
    }

    // For Takeaway/Delivery we ignore reservation/table (if passed, you may attach but not required)

    const order = new Order(orderPayload);

    return order.save();
  }

  async getAllOrders(): Promise<Document[]> {
    return Order.find()
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
     .populate("table")
      .populate("payment");
  }

  async getOrderById(orderId: string): Promise<Document | null> {
    return Order.findById(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment");
  }

  async updateOrderStatus(
    orderId: string,
    status: "Pending" | "Preparing" | "Served" | "Completed"
  ): Promise<Document | null> {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment");
  }

  async deleteOrder(orderId: string): Promise<Document | null> {
    return Order.findByIdAndDelete(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
      .populate("table")
      .populate("payment");
  }

  async linkPayment(
    orderId: string,
    paymentId: Types.ObjectId | string
  ): Promise<Document | null> {
    return Order.findByIdAndUpdate(orderId, { payment: paymentId }, { new: true })
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("reservation")
     .populate("table")
      .populate("payment");
  }
}

export default new OrderService();