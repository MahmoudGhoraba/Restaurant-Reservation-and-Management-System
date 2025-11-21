import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const dbUrl = process.env.DB_URL;
    
    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    await mongoose.connect(dbUrl);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    process.exit(1);
  }
};

export default connectDB;

