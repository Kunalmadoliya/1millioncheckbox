import "dotenv/config";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
   publisher,
   pubClient,
   subClient,
   redisSub,
   redis,
} from "./redis-connection.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

async function main() {
   const PORT = process.env.PORT || 7000;
   const app = express();

   const server = http.createServer(app);
   const io = new Server(server);

   io.adapter(createAdapter(pubClient, subClient));

   const TOTAL = 1000;
   const CHECKBOX_STATE = "checkbox-state";

   let state;
   const existing = await redis.get(CHECKBOX_STATE);

   if (existing) {
      state = JSON.parse(existing);
   } else {
      state = new Array(TOTAL).fill(false);
      await redis.set(CHECKBOX_STATE, JSON.stringify(state));
   }

   await redisSub.subscribe("internal-server:checkbox");

   redisSub.on("message", async (channel, message) => {
      if (channel !== "internal-server:checkbox") return;
      if (!message) return;

      let parsed;
      try {
         parsed = JSON.parse(message);
      } catch {
         return;
      }

      if (
         typeof parsed.index !== "number" ||
         typeof parsed.checked !== "boolean"
      ) return;

      const { index, checked } = parsed;

      state[index] = checked;

      await redis.set(CHECKBOX_STATE, JSON.stringify(state));

      io.emit("server:checked", { index, checked });
   });

   const RATE_LIMIT_WINDOW = 1000;
   const RATE_LIMIT_MAX = 2;
   const BLOCK_TIME = 3000;

   io.on("connection", (socket) => {
      socket.emit("server:init", state);

      let count = 0;
      let lastReset = Date.now();
      let blockedUntil = 0;

      socket.on("user:clicked", async (data) => {
         const now = Date.now();

         if (now < blockedUntil) {
            socket.emit("rate_limit:error", {
               message: "Too many requests. Please wait.",
            });
            return;
         }

         if (now - lastReset > RATE_LIMIT_WINDOW) {
            count = 0;
            lastReset = now;
         }

         count++;

         if (count > RATE_LIMIT_MAX) {
            blockedUntil = now + BLOCK_TIME;

            socket.emit("rate_limit:error", {
               message: "Rate limit exceeded. Temporarily blocked.",
            });

            return;
         }

         if (
            typeof data.index !== "number" ||
            typeof data.checked !== "boolean"
         ) {
            socket.emit("rate_limit:error", {
               message: "Invalid data format",
            });
            return;
         }

         await publisher.publish(
            "internal-server:checkbox",
            JSON.stringify(data)
         );
      });
   });

   const __dirname = dirname(fileURLToPath(import.meta.url));
   app.use(express.static(join(__dirname, "public")));

   app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "public/index.html"));
   });

   app.get("/checked", async (req, res) => {
      const data = await redis.get(CHECKBOX_STATE);
      res.json({ checkboxes: JSON.parse(data) });
   });

   server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
   });
}

main();