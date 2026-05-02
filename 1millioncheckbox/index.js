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
   const check_boxes = 1000;

   const state = {
      checkboxes: new Array(check_boxes).fill(false),
   };

   io.on("connection", (socket) => {

      socket.emit("server:init", state.checkboxes);

      socket.on("user:clicked", (data) => {

        
         state.checkboxes[data.index] = data.checked;


         io.emit("server:checked", {
            index: data.index,
            checked: data.checked,
            all: state.checkboxes
         });

         console.log("Server:", data);
      });

   });
   const __dirname = dirname(fileURLToPath(import.meta.url));


   app.use(express.static(join(__dirname, "public")));


   app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "public/index.html"));
   });

   app.get('/checked', async (req, res) => {
      return res.status(200).json({ checkboxes: state.checkboxes })
   })

   server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
}

main();