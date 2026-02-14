import { S3Client } from "@aws-sdk/client-s3";
import config from "./index.js";

/**
 * Initializes and exports the S3Client for Cloudflare R2 using centralized config.
 */
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});
