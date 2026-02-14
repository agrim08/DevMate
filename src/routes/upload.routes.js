import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { getPresignedUrl, saveProfilePicture } from "../controllers/upload.controller.js";

const router = express.Router();

// All upload routes require authentication
router.use(userAuth);

router.get("/upload/presigned-url", getPresignedUrl);
router.post("/upload/save-profile-picture", saveProfilePicture);

export default router;
