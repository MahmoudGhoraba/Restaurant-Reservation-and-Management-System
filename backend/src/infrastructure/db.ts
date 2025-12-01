import mongoose, { Mongoose } from "mongoose";
// Import all models and schemas
import {
  UserSchema,
  CustomerSchema,
  AdminSchema,
  StaffSchema
} from "../data/models/index";

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

      // Register discriminators after connection is established
      const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

      // Register discriminators only if they haven't been registered yet
      if (!UserModel.discriminators?.Customer) {
        UserModel.discriminator('Customer', CustomerSchema);
      }
      if (!UserModel.discriminators?.Admin) {
        UserModel.discriminator('Admin', AdminSchema);
      }
      if (!UserModel.discriminators?.Staff) {
        UserModel.discriminator('Staff', StaffSchema);
      }

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