import { Request, Response, NextFunction } from "express";
import OrderService from "../services/orderService";
import catchAsync from "../../infrastructure/utils/catchAsync";
import AppError from "../../infrastructure/utils/appError";

class OrderController {
  createOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { items, paymentId } = req.body;

      if (!items || items.length === 0) {
        return next(new AppError("Order must contain at least one item.", 400));
      }

      if (!req.user?.id) {
        return next(new AppError("User not authenticated.", 401));
      }

      const order = await OrderService.createOrder({
        customerId: req.user.id,
        items,
        paymentId,
      });

      res.status(201).json({
        status: "success",
        data: order,
      });
    }
  );

  getAllOrders = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const orders = await OrderService.getAllOrders();

      res.status(200).json({
        status: "success",
        results: orders.length,
        data: orders,
      });
    }
  );

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

  updateOrderStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { status } = req.body;
      const allowed = ["Pending", "Preparing", "Served", "Completed"] as const;

      if (!allowed.includes(status)) {
        return next(new AppError("Invalid status value", 400));
      }

      const order = await OrderService.updateOrderStatus(
        req.params.id,
        status
      );

      if (!order) return next(new AppError("Order not found", 404));

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );

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
}

export default new OrderController();

