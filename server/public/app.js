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
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
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
