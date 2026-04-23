import http from "http";
import express from "express";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {Server} from "socket.io";

async function main(params) {
  const PORT = 3000;
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server);

  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "src/public/index.html"));
  });

  app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("user:message", (msg) => {
      console.log(msg);

      io.emit("server:message", msg);
    });
  });

  server.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
  });
}

main();
