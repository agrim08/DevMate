import { Worker } from "bullmq";
import config from "../config/index.js";
import { githubSyncQueue } from "../config/queue.js"; // Import queue config if needed, or just redis config
import User from "../models/user.js";
import { fetchGitHubData, decryptToken } from "../services/github.service.js";

const redisConnection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};


const processGitHubSync = async (job) => {
  const { userId } = job.data;
  console.log(`Processing GitHub Sync for user: ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user || !user.github || !user.github.accessTokenEncrypted) {
      throw new Error("User not found or GitHub not connected");
    }

    const accessToken = decryptToken(user.github.accessTokenEncrypted);
    if (!accessToken) {
      throw new Error("Failed to decrypt access token");
    }

    const githubData = await fetchGitHubData(accessToken);


    // Merge GitHub languages into user skills
    const existingSkills = user.skills || [];
    const newSkills = githubData.topLanguages || [];
    const mergedSkills = [...new Set([...existingSkills, ...newSkills])];
    
    user.skills = mergedSkills;
    
    // Update user
    user.github = {
      ...user.github,
      ...githubData,
      accessTokenEncrypted: user.github.accessTokenEncrypted, // Ensure we don't overwrite this with undefined
    };

    await user.save();
    console.log(`GitHub Sync completed for user: ${userId}`);
  } catch (error) {
    console.error(`GitHub Sync failed for user ${userId}:`, error.message);
    // If token is invalid (401), maybe disconnect user or mark as error?
    if (error.status === 401) {
        console.error("Token expired or revoked. Disconnecting GitHub.");
        // Logic to disconnect could be added here
    }
    throw error;
  }
};

const worker = new Worker("github-sync", processGitHubSync, {
  connection: redisConnection,
  concurrency: 5, // Process 5 jobs at a time
  limiter: {
    max: 1, // 1 job
    duration: 1000, // per second (GitHub API rate limits are roughly 5000/hr, so ~1.3/sec, safely 1/sec per worker)
    // Actually per user token limit is 5000. So we can increase concurrency if different users.
    // Global checking is tricky. Let's keep it simple.
  }
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});


export default worker;
