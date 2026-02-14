import { SESClient } from "@aws-sdk/client-ses";
import config from "../config/index.js";

/**
 * Initializes and exports the AWS SES Client using centralized config.
 */
const sesClient = new SESClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretKey,
  },
});

export { sesClient };
