import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";
import config from "../config/index.js";

/**
 * Script to configure CORS for the Cloudflare R2 bucket.
 * This is required to allow the frontend (localhost:5173) to upload files directly.
 */
const setupCors = async () => {
  const corsConfiguration = {
    Bucket: config.r2.bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["http://localhost:5173", "http://localhost:4000"], // Add your production domain here later
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  };

  try {
    console.log(`Configuring CORS for bucket: ${config.r2.bucketName}...`);
    await r2.send(new PutBucketCorsCommand(corsConfiguration));
    console.log("✅ CORS configuration updated successfully!");
    console.log("You can now upload files directly from the frontend.");
  } catch (error) {
    console.error("❌ Failed to update CORS configuration:");
    console.error(error.message);
    process.exit(1);
  }
};

setupCors();
