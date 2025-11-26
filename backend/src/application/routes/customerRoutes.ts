import { Router } from "express";
import CustomerController from "../controllers/customer.controller";
import authenticateMiddleware from "../../middlewares/authMiddleware";

const router = Router();


router.get("/menu", CustomerController.browseMenu);

router.post("/order", authenticateMiddleware, CustomerController.placeOrder);
router.get("/order/:orderId", authenticateMiddleware, CustomerController.trackOrder);

router.post("/feedback", authenticateMiddleware, CustomerController.giveFeedback);

export default router;
