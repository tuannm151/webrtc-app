const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(
  server,
  (server,
  {
    cors: {
      origin: "http://127.0.0.1:5173",
    },
  })
);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const socketsMap = new Map();

io.on("connection", (socket) => {
  const id = socket.id;
  socket.on("join-room", (roomId, userName) => {
    console.log(`User ${userName} joined room ${roomId}`);
    socketsMap.set(id, { roomId, userName });
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", {
      msg: `${userName} joined the room`,
      type: "status",
    });
  });
  socket.on("disconnect", () => {
    const { roomId, userName } = socketsMap.get(id) || {};
    if (!roomId || !userName) {
      return;
    }
    socket.broadcast.to(roomId).emit("user-disconnected", {
      msg: `${userName} left the room`,
      type: "status",
    });
    console.log(`User ${userName} disconnected from room ${roomId}`);
    socketsMap.delete(id);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
