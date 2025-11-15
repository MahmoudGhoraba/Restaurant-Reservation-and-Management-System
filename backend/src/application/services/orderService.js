const Order = require("../data/models/Order");

class OrderService {
  static async createOrder({ customerId, staffId = null, items, paymentId = null }) {
    let totalAmount = 0;
    const processedItems = items.map(item => {
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

  static async getOrders(filter = {}) {
    return await Order.find(filter)
      .populate("customer", "name")
      .populate("staff", "name")
      .populate("items.menuItem", "name price")
      .populate("payment");
  }

  static async updateStatus(orderId, status) {
    if (!["Pending", "Preparing", "Served", "Completed"].includes(status)) {
      throw new Error("Invalid order status");
    }
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  static async linkPayment(orderId, paymentId) {
    return await Order.findByIdAndUpdate(orderId, { payment: paymentId }, { new: true });
  }
}

module.exports = OrderService;
