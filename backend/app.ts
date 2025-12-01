import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import Database from "./src/infrastructure/db";
import userRoutes from "./src/application/routes/userRoutes";

const app: Application = express();

Database.getInstance();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("MongoDB connection test!");
});

const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

