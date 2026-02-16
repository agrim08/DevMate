import express from "express";
import { 
    connectGitHub, 
    githubCallback, 
    disconnectGitHub, 
    syncGitHub, 
    getGitHubStats 
} from "../controllers/github.controller.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/connect", userAuth, connectGitHub); // Auth required to know WHO is connecting
router.get("/callback", userAuth, githubCallback); // Auth required to link to user
router.post("/disconnect", userAuth, disconnectGitHub);
router.post("/sync", userAuth, syncGitHub);
router.get("/stats", userAuth, getGitHubStats);

export default router;
