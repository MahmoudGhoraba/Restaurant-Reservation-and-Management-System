import express, { Router } from "express";
import OrderController from "../controllers/orderController";

const router: Router = express.Router();

// Create a new order
router.post("/", OrderController.createOrder);

// Get all orders
router.get("/", OrderController.getAllOrders);

// Get a single order by ID
router.get("/:id", OrderController.getOrderById);

// Update order status
router.patch("/:id/status", OrderController.updateOrderStatus);

// Delete order
router.delete("/:id", OrderController.deleteOrder);

export default router;

