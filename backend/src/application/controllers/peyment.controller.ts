import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/payment.service";
import catchAsync from "../../infrastructure/utils/catchAsync";
import AppError from "../../infrastructure/utils/appError";

class PaymentController {
    // Process a new payment
processPayment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
            const { order, reservation, amount, paymentMethod, cardDetails } = req.body;
            // 1. Basic Validation
            if (!amount || !paymentMethod) {
                return next(new AppError("Amount and Payment Method are required.", 400));
            }
            // 2. Ensure linkage (Must have Order OR Reservation)(Ghoraba)
            if (!order && !reservation) {
                return next(new AppError("Payment must be linked to an Order or Reservation.", 400));
            }
            // 3. Online Payment Validation (Mocking Context)
            if (paymentMethod === "Online" && !cardDetails) {
                return next(new AppError("Card details are required for online transactions.", 400));
            }
            // 4. Call Service
            const payment = await PaymentService.createPayment({
                order: order || undefined,
                reservation: reservation || undefined,
                amount,
                paymentMethod,
                cardDetails,
            });
            res.status(200).json({
                status: "success",
                data: payment,
            });
        }
    );
    // Get all payments (Admin/Manager)
    getAllPayments = catchAsync(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const payments = await PaymentService.getAllPayments();

            res.status(200).json({
                status: "success",
                results: payments.length,
                data: payments,
            });
        }
    );
    // Get a single payment receipt by ID
    getPaymentById = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const payment = await PaymentService.getPaymentById(req.params.id);
            if (!payment) {
                return next(new AppError("Payment transaction not found", 404));
            }
            res.status(200).json({
                status: "success",
                data: payment,
            });
        }
    );

    // Update payment status (Refund or Manual Confirmation)
    updatePaymentStatus = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { status } = req.body;
            const allowed = ["Paid", "Pending", "Refunded"] ;
            if (!allowed.includes(status)) {
                return next(new AppError("Invalid status value", 400));
            }
            const payment = await PaymentService.updatePaymentStatus(req.params.id, status);

            if (!payment) {
                return next(new AppError("Payment transaction not found", 404));
            }
            res.status(200).json({
                status: "success",
                data: payment,
            });
        }
    );

    // Get all payments for a specific Order(Ghoraba)
    getPaymentsByOrder = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { orderId } = req.params;

            const payments = await PaymentService.getPaymentsByOrder(orderId);

            // We return 200 with an empty array if none found, as it's a valid query
            res.status(200).json({
                status: "success",
                results: payments.length,
                data: payments,
            });
        }
    );
}

export default new PaymentController();