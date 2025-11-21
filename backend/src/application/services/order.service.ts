import Order from "../../data/models/order.schema";
import { Types, FilterQuery, Document } from "mongoose";

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
}

class OrderService {
  async createOrder({
    customer,
    staff = null,
    items,
    payment = null,
  }: CreateOrderInput): Promise<Document> {
    let totalAmount = 0;

    const processedItems = items.map(item => {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      return { ...item, subTotal };
    });

    const order = new Order({
      customer,
      staff,
      items: processedItems,
      totalAmount,
      payment,
    });

    return order.save();
  }

  async getAllOrders(): Promise<Document[]> {
    return Order.find()
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("payment");
  }

  async getOrderById(orderId: string): Promise<Document | null> {
    return Order.findById(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
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
      .populate("payment");
  }

  async deleteOrder(orderId: string): Promise<Document | null> {
    return Order.findByIdAndDelete(orderId)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
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
      .populate("payment");
  }
}

export default new OrderService();
