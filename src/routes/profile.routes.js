import { Router } from "express";
import { 
  viewProfile, 
  editProfile, 
  completeProfile 
} from "../controllers/profile.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/profile/view", userAuth, viewProfile);
router.put("/profile/edit", userAuth, editProfile);
router.post("/complete-profile", userAuth, completeProfile);

export default router;
