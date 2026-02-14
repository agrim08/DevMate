import { Router } from "express";
import { getChat } from "../controllers/chat.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/chat/:targetUserId", userAuth, getChat);

export default router;
