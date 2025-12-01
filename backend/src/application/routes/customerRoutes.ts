import express, { Router } from "express";
import CustomerController from "../controllers/customer.controller";
import authenticateMiddleware from "../../middlewares/authMiddleware";

const router: Router = express.Router();


router.get("/menu", CustomerController.browseMenu);

router.get("/order/:orderId", authenticateMiddleware, CustomerController.trackOrder);

router.post("/feedback", authenticateMiddleware, CustomerController.giveFeedback);

export default router;
