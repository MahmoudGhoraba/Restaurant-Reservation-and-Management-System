import mongoose, { Mongoose } from 'mongoose';
import { Provider } from '@nestjs/common';

/**
 * Database Singleton Class
 * Ensures only one MongoDB connection instance exists
 */
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
      const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/restaurant-management';

      await mongoose.connect(dbUrl);
      Database.instance = mongoose;
      console.log('MongoDB Connected Successfully via Singleton');
      return Database.instance;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown MongoDB error');
      console.error('MongoDB Connection Failed:', error);
      process.exit(1);
    }
  }

  public static getConnection(): Mongoose | null {
    return Database.instance;
  }

  public static async disconnect(): Promise<void> {
    if (Database.instance) {
      await mongoose.disconnect();
      Database.instance = null;
      console.log('MongoDB Disconnected');
    }
  }
}

export const DatabaseProvider: Provider = {
  provide: 'DatabaseConnection',
  useFactory: async (): Promise<Mongoose> => {
    return await Database.getInstance();
  },
};

export default Database;
