import Razorpay from "razorpay";
import config from "../config/index.js";

/**
 * Initializes and exports the Razorpay instance using centralized config.
 */
const instance = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export default instance;
