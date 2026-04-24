import http from "http";
import express from "express";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

async function main() {
   const PORT = 7000;
   const app = express();

   const server = http.createServer(app);
   const io = new Server(server);

   io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
      socket.on("user:clicked", (index) => {
         io.emit("server:clicked", index)
      })
   });

   const __dirname = dirname(fileURLToPath(import.meta.url));


   app.use(express.static(join(__dirname, "src")));


   app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "src/index.html"));
   });

   server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
}

main();