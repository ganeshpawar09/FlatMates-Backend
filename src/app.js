import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

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



// verify user AccessToken
io.use((socket, next) => {
  verifyAccessToken(socket.handshake.query, null, next);
});
// if user Access tokent
io.on("connection", (socket) => {
  console.log(`User connected:${socket.id} `);
  // Your socket connection logic goes here

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});




//routes imports
import userRouter from "./routes/user.route.js";
import flatRouter from "./routes/flat.route.js";

//routes declartion

app.use("/api/v1/user", userRouter);
app.use("/api/v1/flat", flatRouter);

export { server };
