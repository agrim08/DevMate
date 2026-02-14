import mongoose from "mongoose";
import config from "./index.js";

/**
 * Connects to the MongoDB database using the URI stored in the config.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.mongodbUri);
    console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
