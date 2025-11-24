import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import Database from "./src/infrastructure/db";

const app: Application = express();

Database.getInstance();

app.get("/", (req: Request, res: Response) => {
  res.send("MongoDB connection test!");
});

const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

