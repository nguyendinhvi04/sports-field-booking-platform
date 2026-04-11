import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const pubClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const subClient = pubClient.duplicate();

redis.on("connect", () => {
  console.log("✓ Redis connected");
});

redis.on("error", (err) => {
  console.error("REDIS_CONNECTION_ERROR:", err);
});
