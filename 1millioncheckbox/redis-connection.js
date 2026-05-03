import Redis from "ioredis";

function createRedisConnection(name = "redis") {
  const isProd = !!process.env.REDIS_URL;

  const client = isProd
    ? new Redis(process.env.REDIS_URL) // ✅ Railway
    : new Redis({
      host: "127.0.0.1", // ✅ local
      port: 6379,
      family: 4,
    });

  // ✅ logs (very important for debugging)
  client.on("connect", () =>
    console.log(`✅ ${name} connected`)
  );

  client.on("ready", () =>
    console.log(`🚀 ${name} ready`)
  );

  client.on("error", (err) =>
    console.error(`❌ ${name} error:`, err.message)
  );

  return client;
}

// ✅ publisher (send events)
export const publisher = createRedisConnection("publisher");

// ✅ optional general subscriber
export const subscriber = createRedisConnection("subscriber");

export const redis = createRedisConnection()

// ✅ Socket.IO adapter (must be separate)
export const pubClient = createRedisConnection("pubClient");
export const subClient = createRedisConnection("subClient");

// ✅ custom channel listener
export const redisSub = createRedisConnection("redisSub");