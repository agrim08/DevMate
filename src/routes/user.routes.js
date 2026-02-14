import { Router } from "express";
import { 
  getPendingRequests, 
  getConnections, 
  getUserFeed 
} from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/user/requests/pending", userAuth, getPendingRequests);
router.get("/user/connections", userAuth, getConnections);
router.get("/feed", userAuth, getUserFeed);

export default router;
