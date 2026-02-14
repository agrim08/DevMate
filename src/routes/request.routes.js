import { Router } from "express";
import { 
  sendConnectionRequest, 
  reviewConnectionRequest 
} from "../controllers/request.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/request/send/:status/:toUserId", userAuth, sendConnectionRequest);
router.post("/request/review/:status/:requestId", userAuth, reviewConnectionRequest);

export default router;
