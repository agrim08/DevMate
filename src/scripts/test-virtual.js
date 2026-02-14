import mongoose from "mongoose";
import User from "../models/user.js";
import config from "../config/index.js";

const testVirtual = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ emailId: "jake@gmail.com" });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    console.log("User Object (Raw):", user.toObject());
    console.log("User JSON (with virtuals):", user.toJSON());
    console.log("isProfileComplete value:", user.isProfileComplete);

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testVirtual();
