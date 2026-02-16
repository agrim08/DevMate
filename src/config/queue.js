import { Queue } from "bullmq";
import config from "./index.js";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const githubSyncQueue = new Queue("github-sync", {
  connection: redisConnection,
});

export default {
  githubSyncQueue,
  redisConnection,
};
