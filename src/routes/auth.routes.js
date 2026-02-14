import { Router } from "express";
import { 
  signup, 
  login, 
  logout, 
  forgotPassword, 
  verifyEmail 
} from "../controllers/auth.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", userAuth, forgotPassword);
router.post("/verify-email", verifyEmail);

export default router;
