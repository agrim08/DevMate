import { Router } from "express";
import { 
  createOrder, 
  handleWebhook, 
  verifyPremium 
} from "../controllers/payment.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/payment/create-order", userAuth, createOrder);
router.post("/payment/webhook", handleWebhook);
router.get("/premium/verify", userAuth, verifyPremium);

export default router;
