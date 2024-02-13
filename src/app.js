import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user connection
  socket.on("user_connect", async ({ userId }) => {
    try {
      console.log(userId);

      const user = await User.findById(userId);

      if (user) {
        // Update the socketId for the user
        await User.findByIdAndUpdate(userId, {
          $set: { socketId: socket.id },
        });

        // Join each chat room the user is a member of
        user.chats.forEach((chatId) => {
          socket.join(chatId);
          io.to(chatId).emit(
            "newMemberInChat",
            `userName${user.name} room id${chatId}`
          );
        });
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ chatId, content, senderId }) => {
    try {
      const chat = await Chat.findById(chatId);

      if (chat) {
        const message = new Message({
          content: content,
          sender: senderId,
        });

        await message.save();
        chat.messages.push(message);
        await chat.save();

        console.table([chatId, content, senderId]);

        // Emit the new message to all users in the chat room
        io.to(chatId).emit("newMessage", { message });
      } else {
        console.log("Chat not found");
      }
    } catch (error) {
      console.error("Error storing message:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`Socket id: ${socket.id} is disconnected`);
  });
});

//routes imports
import userRouter from "./routes/user.route.js";
import flatRouter from "./routes/flat.route.js";
import chatRouter from "./routes/chat.route.js";
import { User } from "./models/user.model.js";
import { Message } from "./models/message_model.js";
import { Chat } from "./models/chat.model.js";

//routes declartion

app.use("/api/v1/user", userRouter);
app.use("/api/v1/flat", flatRouter);
app.use("/api/v1/chat", chatRouter);

export { server };

//
// socket.on("joinRoom", ({ roomId }) => {
//   console.log(`Received request to join room: ${roomId}`);

//   socket.join(roomId);
// });

// socket.on("sendMessage", async ({ chatId, content, senderId }) => {
//   try {
//     const chat = await Chat.findById(chatId);
//     if (chat) {
//       const message = new Message({
//         content: content,
//         sender: senderId,
//       });
//       await message.save();
//       chat.messages.push(message);
//       await chat.save();
//       console.table([chatId, content, senderId]);
//       io.to(chatId).emit("newMessage", { message });
//     } else {
//       console.log("Something went wrong while sending message");
//     }
//   } catch (error) {
//     console.error("Error storing message:", error);
//   }
// });

// socket.on("newMessage", ({ message }) => {
//   console.log("New message received:", message);
// });
// socket.on("connect_to_chat", async (otherUserId, chatId) => {
//   try {
//     console.log(chatId);

//     const user = await User.findById(otherUserId);
//     socket.join(chatId);

//     if (user) {
//       io.to(user.socketId).emit("join_room", { roomId });
//     } else {
//       console.log("User not found");
//     }
//   } catch (error) {
//     console.error("Error updating user:", error);
//   }
// });

// socket.on("user_disconnect", async (userId) => {
//   try {
//     const user = await User.findById(userId);

//     if (user) {
//       user.chats.forEach((chatId) => {
//         socket.leave(chatId);
//         console.log(chatId);
//       });
//     } else {
//       console.log("User not found");
//     }
//   } catch (error) {
//     console.error("Error finding user:", error);
//   }
// });
