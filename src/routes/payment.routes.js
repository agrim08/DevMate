import { Router } from "express";
import { 
  createOrder, 
  handleWebhook, 
  verifyPayment 
} from "../controllers/payment.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/payment/create-order", userAuth, createOrder);
router.post("/payment/webhook", handleWebhook);
router.post("/payment/verify", userAuth, verifyPayment);

export default router;
