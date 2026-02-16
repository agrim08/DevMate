import { Octokit } from "octokit";
import config from "../config/index.js";
import User from "../models/user.js";
import { encryptToken, fetchGitHubData } from "../services/github.service.js";
import { githubSyncQueue } from "../config/queue.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const connectGitHub = asyncHandler(async (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=read:user,repo&redirect_uri=${encodeURIComponent(config.github.callbackUrl)}`;
  res.redirect(redirectUrl);
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json(new ApiResponse(400, null, "No code provided"));
  }

  try {
    // Exchange code for token
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl,
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      return res.status(400).json(new ApiResponse(400, null, "Failed to get access token"));
    }

    // Encrypt token
    const encryptedToken = encryptToken(accessToken);

    // Fetch initial data
    const githubData = await fetchGitHubData(accessToken);

    // Update user
    // We need the logged-in user context.
    // OAuth callback usually comes from browser. 
    // If we rely on session/cookie, we need to ensure it's there.
    // Alternatively, we can pass a state param with the JWT or userId, but that's risky if not signed.
    // Better approach: The callback redirects to frontend with specific status, frontend calls backend to `finalize`?
    // OR: The user is already logged in (JWT in cookie).
    // If the user initiated the flow, they should have the auth cookie.
    
    // Assuming `req.user` is available via auth middleware, BUT
    // updates to `connectGitHub` endpoint might be needed to pass `req.user._id` in state if we want to be stateless or cross-device safe.
    // But typically for this app, we can assume the user is logged in.
    // However, the callback route is public?
    // If this is a server-side redirect, the browser follows it, so cookies should be sent if SameSite allows.
    
    // Check if we can get user from request (middleware should run on callback if we want `req.user`).
    // But `req.user` might not be populated if we don't apply auth middleware to this route.
    // Let's assume we will protect this route or use `state` parameter properly.
    // For now, let's look at `req.user`.
    
    // Wait, standard OAuth flow:
    // 1. Frontend calls /api/github/connect -> 302 to GitHub
    // 2. GitHub -> /api/github/callback -> Backend logic -> 302 to Frontend
    
    // In step 2, the browser makes the request. If the cookie is set, we can identify the user.
    // So we need `auth` middleware on the callback route.
    
    const userId = req.user?._id; 
    if (!userId) {
        // If no user, maybe we can't link. 
        // We could redirect to frontend with error.
        return res.redirect(`${config.frontendUrl}/profile?error=auth_failed`);
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.redirect(`${config.frontendUrl}/profile?error=user_not_found`);
    }


    // Merge GitHub languages into user skills
    const existingSkills = user.skills || [];
    const newSkills = githubData.topLanguages || [];
    const mergedSkills = [...new Set([...existingSkills, ...newSkills])];
    
    user.skills = mergedSkills;
    user.github = {
      ...githubData,
      accessTokenEncrypted: encryptedToken,
    };
    
    await user.save();

    // Schedule periodic sync (if not already scheduled)
    // We can add a repeatable job for this user.
    // Or just rely on the cron/queue we set up.
    // For now, initial sync is done.

    res.redirect(`${config.frontendUrl}/profile?success=github_connected`);

  } catch (error) {
    console.error("GitHub Callback Error:", error);
    res.redirect(`${config.frontendUrl}/profile?error=process_failed`);
  }
});

export const disconnectGitHub = asyncHandler(async (req, res) => {
    const user = req.user;
    
    user.github = undefined; // or null
    await user.save();

    // Remove any scheduled jobs for this user if we had them.

    res.status(200).json(new ApiResponse(200, null, "GitHub disconnected successfully"));
});

export const syncGitHub = asyncHandler(async (req, res) => {
    const user = req.user;

    // Check rate limit (e.g. once every hour or 24h?)
    // Requirement says "Only allow sync if lastSyncedAt > 24h"
    // But manual sync might be allowed more often? Let's stick to 24h for now or maybe 10 mins for testing.
    // User requirement: "Sync GitHub data once every 24 hours" (background). "Allow user to disconnect".
    // "POST /api/github/sync" implies manual trigger.
    
    const lastSynced = user.github?.lastSyncedAt;
    if (lastSynced) {
        const diff = new Date() - new Date(lastSynced);
        const hours = diff / (1000 * 60 * 60);
        if (hours < 24) {
             return res.status(429).json(new ApiResponse(429, null, "Please wait 24 hours between syncs."));
        }
    }

    // Add to queue
    await githubSyncQueue.add("manual-sync", { userId: user._id });

    res.status(200).json(new ApiResponse(200, null, "Sync started"));
});

export const getGitHubStats = asyncHandler(async (req, res) => {
    // Just return what's in DB
    const user = req.user;
    res.status(200).json(new ApiResponse(200, user.github, "GitHub stats fetched"));
});
