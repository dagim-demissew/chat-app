import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    orgin: [""],
    methods: ["GET", "POST"],
  },
});
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
const userSocketMap = {}; //maps socket Id to users Id

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  //socket.on() used to listen to events both on client and server side
  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    //io.emit used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, io, server };
