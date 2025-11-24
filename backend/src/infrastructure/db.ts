import mongoose, { Mongoose } from "mongoose";

class Database {
  private static instance: Mongoose | null = null;

  private constructor() {
    // Prevent instantiation
  }

  public static async getInstance(): Promise<Mongoose> {
    if (Database.instance) {
      return Database.instance;
    }

    try {
      const dbUrl = process.env.DB_URL;

      if (!dbUrl) {
        throw new Error("DB_URL is not defined in environment variables");
      }

      await mongoose.connect(dbUrl);
      Database.instance = mongoose;
      console.log("MongoDB Connected Successfully");
      return Database.instance;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown MongoDB error");
      console.error("MongoDB Connection Failed:", error);
      process.exit(1);
      throw error;
    }
  }
}

export default Database;

