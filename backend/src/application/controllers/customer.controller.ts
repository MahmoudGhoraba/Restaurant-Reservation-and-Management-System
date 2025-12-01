import { Request, Response, NextFunction } from "express";
import CustomerService from "../services/customer.service";
import catchAsync from "../../infrastructure/utils/catchAsync";
import AppError from "../../infrastructure/utils/appError";

class CustomerController {

  browseMenu = catchAsync(async (req: Request, res: Response) => {
    const menu = await CustomerService.browseMenu();

    res.status(200).json({
      status: "success",
      results: menu.length,
      data: menu,
    });
  });

  trackOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = await CustomerService.trackOrder(req.params.orderId);

    if (!order) return next(new AppError("Order not found", 404));

    res.status(200).json({
      status: "success",
      data: order,
    });
  });

  giveFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id,referenceId, rating, comment } = req.body;

    if (!id) {
      return next(new AppError("User not authenticated", 401));
    }
    const result = await CustomerService.giveFeedback(
      id as string,
      referenceId,
      rating,
      comment
    );

    res.status(201).json({
      status: "success",
      data: result,
    });
  });
}

export default new CustomerController();
