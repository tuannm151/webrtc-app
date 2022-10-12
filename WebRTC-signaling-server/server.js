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

// tạo map lưu trữ data của các user với key là socket id
const socketsMap = new Map();

io.on("connection", (socket) => {
  const id = socket.id;

  // listen socket event một user muốn connect vào room
  socket.on("join-room", (roomId, userName) => {
    console.log(`User ${userName} joined room ${roomId}`);

    // join socket vào room
    socket.join(roomId);

    // boardcast thông báo cho các user khác trong room
    socket.broadcast.to(roomId).emit("user-connected", {
      msg: `${userName} joined the room`,
      type: "status",
      source: id,
    });

    // lưu data của user vào map
    socketsMap.set(id, { roomId, userName });
  });

  socket.on("offer", (offer, data) => {
    // gửi offer cho user vừa connect vào room
    io.to(data.dest).emit("offer", offer, {
      source: data.source,
    });
  });
  socket.on("answer", (answer, data) => {
    // gửi answer cho user vừa gửi offer
    io.to(data.dest).emit("answer", answer);
  });

  // listen socket event một user disconnect
  socket.on("disconnect", () => {
    const { roomId, userName } = socketsMap.get(id) || {};
    if (!roomId || !userName) {
      return;
    }

    // broadcast thông báo cho các user khác trong room
    socket.broadcast.to(roomId).emit("user-disconnected", {
      msg: `${userName} left the room`,
      type: "status",
      source: id,
    });
    console.log(`User ${userName} disconnected from room ${roomId}`);

    // xoá user khỏi map
    socketsMap.delete(id);
  });

  // listen socker event offer và gửi offer đến các peer trong room
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
