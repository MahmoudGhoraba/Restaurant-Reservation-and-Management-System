import express, { Router } from "express";
import OrderController from "../controllers/order.controller";
import authenticateMiddleware from "../../middlewares/authMiddleware"
import authorizationMiddleware from "../../middlewares/authorizeMiddleware"
import allowAdmin from "../../middlewares/allowAdminMiddleware"

const router: Router = express.Router();

// Create a new order
router.post("/", authenticateMiddleware,authorizationMiddleware('Customer'),OrderController.createOrder);

// Get all orders
router.get("/",authenticateMiddleware,authorizationMiddleware("Admin","Staff"), OrderController.getAllOrders);

// Get a single order by ID
router.get("/:id",authenticateMiddleware,authorizationMiddleware("Customer","Admin","Staff"), OrderController.getOrderById);

// Update order status
router.patch("/:id/status",authenticateMiddleware,authorizationMiddleware("Admin","Staff"), OrderController.updateOrderStatus);

// Delete order
router.delete("/:id",authenticateMiddleware,authorizationMiddleware("Customer","Admin"), OrderController.deleteOrder);

export default router;

