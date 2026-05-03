import Redis from "ioredis";

function createRedisConnection() {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️ REDIS_URL not found, falling back to localhost");
    return new Redis({
      host: "127.0.0.1",
      port: 6379,
    });
  }

  // ✅ Railway / production
  return new Redis(process.env.REDIS_URL);
}

// ✅ publisher (for emitting events)
export const publisher = createRedisConnection();

// ✅ subscriber (general purpose if needed)
export const subscriber = createRedisConnection();

// ✅ Socket.IO adapter clients
export const pubClient = createRedisConnection();
export const subClient = createRedisConnection();

// ✅ custom channel subscriber
export const redisSub = createRedisConnection();