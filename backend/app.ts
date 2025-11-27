import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Database from "./src/infrastructure/db";
import userRoutes from "./src/application/routes/userRoutes";
import tableRoutes from "./src/application/routes/tableroutes";
import reservationRoutes from "./src/application/routes/reservationRoutes";
import reportRoutes from "./src/application/routes/reportRoutes";
import paymentRoutes from "./src/application/routes/payment.routes";
import orderRoutes from "./src/application/routes/orderRoutes";
import menu from "./src/application/routes/menu";
import index from "./src/application/routes/index";
import feedbackRoutes from "./src/application/routes/feedbackRoutes";
import customerRoutes from "./src/application/routes/customerRoutes";

import { setupSwagger } from "./src/config/swagger";

const app: Application = express();

Database.getInstance();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tables", tableRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/menu", menu);
app.use("/api/v1", index);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/customers", customerRoutes);

// Setup Swagger documentation
setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🍽️ Restaurant Reservation & Management System API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      users: "/api/v1/users",
      tables: "/api/v1/tables",
      reservations: "/api/v1/reservations",
      reports: "/api/v1/reports",
      payments: "/api/v1/payments",
      orders: "/api/v1/orders",
      menu: "/api/v1/menu",
      feedback: "/api/v1/feedback",
      customers: "/api/v1/customers"
    }
  });
});

const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

