import Order from "../../data/models/Order";
import { IOrder, ICreateOrderDTO } from "../../types/order.types";
import { Types, FilterQuery } from "mongoose";

class OrderService {
  static async createOrder({
    customerId,
    staffId = null,
    items,
    paymentId = null,
  }: ICreateOrderDTO): Promise<IOrder> {
    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      return { ...item, subTotal };
    });

    const order = new Order({
      customer: customerId,
      staff: staffId,
      items: processedItems,
      totalAmount,
      payment: paymentId,
    });

    return await order.save();
  }

  static async getAllOrders(): Promise<IOrder[]> {
    return await Order.find()
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("payment");
  }

  static async getOrderById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("payment");
  }

  static async getOrders(
    filter: FilterQuery<IOrder> = {}
  ): Promise<IOrder[]> {
    return await Order.find(filter)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("payment");
  }

  static async updateOrderStatus(
    orderId: string,
    status: "Pending" | "Preparing" | "Served" | "Completed"
  ): Promise<IOrder | null> {
    const validStatuses = ["Pending", "Preparing", "Served", "Completed"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  static async deleteOrder(orderId: string): Promise<IOrder | null> {
    return await Order.findByIdAndDelete(orderId);
  }

  static async linkPayment(
    orderId: string,
    paymentId: Types.ObjectId | string
  ): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(
      orderId,
      { payment: paymentId },
      { new: true }
    );
  }
}

export default OrderService;

