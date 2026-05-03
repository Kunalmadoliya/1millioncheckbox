import Redis from "ioredis";

function createRedisConnection() {
  return new Redis({
    host: "localhost",
    port: 6379,
  });
}

// ✅ for publishing events
export const publisher = createRedisConnection();

// ❗ do NOT reuse this everywhere blindly
export const subscriber = createRedisConnection();

// ✅ dedicated for Socket.IO adapter (important)
export const pubClient = createRedisConnection();
export const subClient = createRedisConnection();

// ✅ dedicated for your custom channel
export const redisSub = createRedisConnection();