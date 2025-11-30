import dotenv from "dotenv";
dotenv.config();

// Import all models early to ensure discriminators are registered
import "./src/data/models/index";
import indexRoutes from "./src/application/routes/index"
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import Database from "./src/infrastructure/db";
import userRoutes from "./src/application/routes/userRoutes";

const app: Application = express();

Database.getInstance();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", indexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("MongoDB connection test!");
});

const PORT: number = parseInt(process.env.PORT || "3000", 10);

const startServer = async () => {
  try {
    await Database.getInstance();
    console.log("Database connected successfully");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

