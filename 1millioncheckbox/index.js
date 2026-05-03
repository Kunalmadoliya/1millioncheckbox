import http from "http";
import express from "express";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { publisher } from "./redis-connection.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

async function main() {
   const PORT = 7000;
   const app = express();

   const server = http.createServer(app);
   const io = new Server(server);

   // ✅ Redis clients for Socket.IO adapter
   const pubClient = new Redis();
   const subClient = new Redis();
   io.adapter(createAdapter(pubClient, subClient));

   // ✅ Redis client for your checkbox channel
   const redisSub = new Redis();
   await redisSub.subscribe("internal-server:checkbox");

   const TOTAL = 1000;

   const state = {
      checkboxes: new Array(TOTAL).fill(false),
   };

   // ✅ Listen to Redis messages
   redisSub.on("message", (channel, message) => {
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

      state.checkboxes[index] = checked;

      // ✅ broadcast to all clients (works across servers)
      io.emit("server:checked", { index, checked });
   });

   // ✅ Socket connection
   io.on("connection", (socket) => {
      socket.emit("server:init", state.checkboxes);

      socket.on("user:clicked", async (data) => {
         if (
            typeof data.index !== "number" ||
            typeof data.checked !== "boolean"
         ) return;

         await publisher.publish(
            "internal-server:checkbox",
            JSON.stringify(data)
         );
      });
   });

   // ✅ Static setup
   const __dirname = dirname(fileURLToPath(import.meta.url));
   app.use(express.static(join(__dirname, "public")));

   app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "public/index.html"));
   });

   app.get("/checked", (req, res) => {
      res.json({ checkboxes: state.checkboxes });
   });

   // ✅ Start server
   server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
}

main();