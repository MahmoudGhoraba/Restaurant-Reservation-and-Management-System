import { Request, Response, NextFunction } from "express";
import OrderService from "../services/order.service";
import catchAsync from "../../infrastructure/utils/catchAsync";
import AppError from "../../infrastructure/utils/appError";

class OrderController {
  // Create a new order
  createOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { items, payment } = req.body;

      if (!items || items.length === 0) {
        return next(new AppError("Order must contain at least one item.", 400));
      }

      if (!req.user?.id) {
        return next(new AppError("User not authenticated.", 401));
      }

      const order = await OrderService.createOrder({
        customer: req.user.id,
        items,
        payment: payment || null,
      });

      res.status(201).json({
        status: "success",
        data: order,
      });
    }
  );

  // Get all orders
  getAllOrders = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const orders = await OrderService.getAllOrders();

      res.status(200).json({
        status: "success",
        results: orders.length,
        data: orders,
      });
    }
  );

  // Get a single order by ID
  getOrderById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const order = await OrderService.getOrderById(req.params.id);

      if (!order) return next(new AppError("Order not found", 404));

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );

  // Update order status
  updateOrderStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { status } = req.body;
      const allowed = ["Pending", "Preparing", "Served", "Completed"] as const;

      if (!allowed.includes(status)) {
        return next(new AppError("Invalid status value", 400));
      }

      const order = await OrderService.updateOrderStatus(req.params.id, status);

      if (!order) return next(new AppError("Order not found", 404));

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );

  // Delete an order
  deleteOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const deleted = await OrderService.deleteOrder(req.params.id);

      if (!deleted) return next(new AppError("Order not found", 404));

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  // Optional: link payment to order
  linkPayment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { paymentId } = req.body;
      if (!paymentId) return next(new AppError("Payment ID is required", 400));

      const order = await OrderService.linkPayment(req.params.id, paymentId);

      if (!order) return next(new AppError("Order not found", 404));

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );
}

export default new OrderController();
