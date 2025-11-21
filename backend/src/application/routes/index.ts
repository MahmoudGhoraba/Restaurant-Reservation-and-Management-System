import express, { Router } from "express";
import orderRoutes from "./orderRoutes";

const router: Router = express.Router();

router.use("/orders", orderRoutes);

export default router;

