import CustomerModel, { ICustomer } from "../../data/models/customer.schema";
import User from "../../data/models/user.schema";
import { MenuItem } from "../../data/models/menuitem.schema";
import Order from "../../data/models/order.schema";
import Feedback from "../../data/models/feedback.schema";
import { Types } from "mongoose";

class CustomerService {


  async browseMenu() {
    return MenuItem.find().populate("category", "name");
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

    const order = new Order({
      customer: new Types.ObjectId(customerId),
      items: processedItems,
      totalAmount,
      payment: paymentId ? new Types.ObjectId(paymentId) : undefined,
    });

    return order.save();
  }

  async trackOrder(orderId: string) {
    return Order.findById(orderId)
      .populate("items.menuItem", "name price")
      .populate("customer", "name");
  }


  async giveFeedback(customerId: string, referenceId: string, rating: number, comment: string) {
    const feedback = new Feedback({
      customer: new Types.ObjectId(customerId),
      referenceId: new Types.ObjectId(referenceId),
      rating,
      comments: comment,
    });

    return feedback.save();
  }
}

export default new CustomerService();
