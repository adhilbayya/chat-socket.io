import { Server } from "socket.io";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

//in module es we have to there is no __dirname function so we have to use the fileURLtoPath and convert it into usable
//if we are using the normal default we dont have to add all these just give the __dirname in the path.join()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin";
const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const UserState = {
  users: [],
  setUsers: function (newUsers) {
    this.users = newUsers;
  },
};

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

  socket.emit("message", buildMsg(ADMIN, "Welcome to the chat room"));

  socket.on("enterRoom", ({ name, room }) => {
    const prevRoom = getUser(socket.id)?.room;

    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        "message",
        buildMsg(ADMIN, `${name} has left the room`)
      );
    }

    const user = activateUser(socket.id, name, room);

    if (prevRoom) {
      io.to(prevRoom).emit("userList", {
        users: getUsersInRoom(prevRoom),
      });
    }

    socket.join(user.room);

    socket.emit(
      "message",
      buildMsg(ADMIN, `You have joined the ${user.room} chat room`)
    );

    socket.broadcast
      .to(user.room)
      .emit("message", buildMsg(ADMIN, `${user.name} has joined the room`));

    io.to(user.room).emit("userList", {
      users: getUsersInRoom(user.room),
    });

    io.emit("roomList", {
      rooms: getAllActiveRooms(),
    });
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    userLeavesApp(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        buildMsg(ADMIN, `${user.name} has left the room`)
      );

      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });

      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });
    }

    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });

  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

const buildMsg = (name, text) => {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
};

function activateUser(id, name, room) {
  const user = { id, name, room };
  UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UserState.setUsers(UserState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UserState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UserState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(UserState.users.map((user) => user.room)));
}
