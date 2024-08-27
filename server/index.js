import { Server } from "socket.io";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

//in module es we have to there is no __dirname function so we have to use the fileURLtoPath and convert it into usable
//if we are using the normal default we dont have to add all these just give the __dirname in the path.join()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3500;
const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
  });
});
