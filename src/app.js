import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
//this will allow the data endcode in url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());

// if user Access tokent
// io.on("connection", (socket) => {
//   console.log(`User connected:${socket.id} `);

//   socket.on("user_connect", async (userId) => {
//     const user = User.findByIdAndUpdate(userId, {
//       $set: { socketId: socket.id },
//     });
//     user.rooms.forEach((room) => {
//       socket.join(room.customId);
//     });
//   });
//   socket.on("join_new_room", async (roomId) => {
//     socket.join(roomId);
//   });
//   socket.on("message", async (roomId, message, senderId) => {
//     const room = Room.findById(roomId);
//     const m = new Message({ content: message, sender: senderId });
//   });

//   socket.on("disconnect", async (userId) => {
//     const user = await User.findById(userId);
//     user.rooms.forEach((room) => {
//       socket.leave(room.customId);
//     });
//   });
// });



//routes imports
import userRouter from "./routes/user.route.js";
import flatRouter from "./routes/flat.route.js";
import chatRouter from "./routes/chat.route.js";


//routes declartion

app.use("/api/v1/user", userRouter);
app.use("/api/v1/flat", flatRouter);
app.use("/api/v1/chat", chatRouter);

export { app };
