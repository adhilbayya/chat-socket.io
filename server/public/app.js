const socket = io("ws://localhost:3500");

const activity = document.querySelector(".activity");
const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const roomId = document.querySelector("#room");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

const sendMessage = (e) => {
  e.preventDefault();
  if (roomId.value && msgInput.value && nameInput.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
};

const enterRoom = (e) => {
  e.preventDefault();
  if (nameInput.value && roomId.value) {
    socket.emit("message", {
      name: nameInput.value,
      room: roomId.value,
    });
  }
};

document.querySelector(".form-join").addEventListener("submit", enterRoom);

document.querySelector(".form-send").addEventListener("submit", sendMessage);

socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  if (name === nameInput.value) li.className = "post post--left";
  if (name !== nameInput.value && name !== "Admin")
    li.className = "post post--right";

  if (name === "Admin") {
    li.innerHTML = `<div class="post--header ${
      name === nameInput.value ? "post--header--user" : "post--header--reply"
    }">
      <span class="post--header--name">${name}</span>
      <span class="post--header--time">${time}</span>
    </div>
    <div class="post--text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post--text">${text}</div>`;
  }
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

input.addEventListener("keypress", () => {
  socket.emit("activity", socket.id.substring(0, 5));
});

let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing....`;

  clearTimeout(activityTimer);

  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 1000);
});

const showUsers = (users) => {
  usersList.textContent = "";
  if (users) {
    usersList.innerHTML = `<em>Users in ${roomId.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ",";
      }
    });
  }
};

const showRooms = (rooms) => {
  roomList.textContent = "";
  if (rooms) {
    roomList.innerHTML = `<em>Active rooms:</em>`;
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ",";
      }
    });
  }
};
