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
} from "./redis-connection.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

async function main() {
   const PORT = process.env.PORT || 7000;
   const app = express();

   const server = http.createServer(app);
   const io = new Server(server);

   // ✅ use shared Redis clients (no new Redis())
   io.adapter(createAdapter(pubClient, subClient));

   // ✅ subscribe once
   await redisSub.subscribe("internal-server:checkbox");

   const TOTAL = 1000;

   const state = {
      checkboxes: new Array(TOTAL).fill(false),
   };

   // ✅ listen for Redis messages
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

      io.emit("server:checked", { index, checked });
   });

   // ✅ socket connection
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

   // ✅ static setup
   const __dirname = dirname(fileURLToPath(import.meta.url));
   app.use(express.static(join(__dirname, "public")));

   app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "public/index.html"));
   });

   app.get("/checked", (req, res) => {
      res.json({ checkboxes: state.checkboxes });
   });

   server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
   });
}

main();