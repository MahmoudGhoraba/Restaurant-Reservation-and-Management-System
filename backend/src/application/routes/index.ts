import express, { Router } from "express";
import orderRoutes from "./orderRoutes";
import CustomerRoutes from "./customerRoutes"
import feedbackRoutes from "./feedbackRoutes"
import menuRoutes from "./menu"
import paymentRoutes from "./payment.routes"
import reportroutes from "./reportRoutes"
import reservationRoutes from "./reservationRoutes"
import tableRoutes from "./tableroutes"
import userRoutes from "./userRoutes"

const router: Router = express.Router();

router.use("/orders", orderRoutes);
router.use("/customers",CustomerRoutes);
router.use("/feedbacks",feedbackRoutes);
router.use("/menuItems",feedbackRoutes);
router.use("/payments",paymentRoutes);
router.use("/reports",reportroutes);
router.use("/reservations",reservationRoutes);
router.use("/tables",tableRoutes);
router.use("/users",userRoutes);

export default router;

