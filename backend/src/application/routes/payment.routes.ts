import express, { Router } from "express";
import PaymentController from "../controllers/payment.controller";

const router: Router = express.Router();

// Process a new payment
router.post("/", PaymentController.processPayment);

// Get all payments
router.get("/", PaymentController.getAllPayments);

// Get all payments for a specific order
router.get("/order/:orderId", PaymentController.getPaymentsByOrder);

// Get a single payment by ID
router.get("/:id", PaymentController.getPaymentById);

// Update payment status
router.patch("/:id/status", PaymentController.updatePaymentStatus);

export default router;