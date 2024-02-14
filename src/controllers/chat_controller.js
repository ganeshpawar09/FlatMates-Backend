import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message_model.js";
import { User } from "../models/user.model.js";
import { Flat } from "../models/flat.model.js";

const createNewChat = asyncHandler(async (req, res) => {
  const { userId, ownerId, flatId } = req.body;
  if (!userId || !ownerId || !flatId) {
    throw new ApiError(400, "userId, ownerId, and flatId are required");
  }

  const user = await User.findById(userId);
  const owner = await User.findById(ownerId);
  const flat = await Flat.findById(flatId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  if (!owner) {
    throw new ApiError(404, "Owner Not Found");
  }
  if (!flat) {
    throw new ApiError(404, "Flat Not Found");
  }
  if (user.id === owner.id) {
    throw new ApiError(400, "You are the owner");
  }

  let chat = await Chat.findOne({
    $or: [
      { customId: `${userId}${ownerId}` },
      { customId: `${ownerId}${userId}` },
    ],
  });

  if (chat) {
    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Chat already exists"));
  }

  const newId = `${userId}${ownerId}`;
  chat = await Chat.create({
    name: `${user.name} and ${owner.name}`,
    customId: newId,
    flat: flat,
    messages: [],
  });

  if (chat) {
    user.chats.push(chat.id);
    owner.chats.push(chat.id);
    await user.save();
    await owner.save();
    return res.status(200).json(new ApiResponse(200, chat, "New Chat created"));
  }
});

const fetchChat = asyncHandler(async (req, res) => {
  const userId = req.header("userId");
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const chatPromises = user.chats.map(async (chatId) => {
    return await Chat.findById(chatId); // Use findById instead of find
  });

  const chats = await Promise.all(chatPromises);

  return res.status(200).json(new ApiResponse(200, chats, "Success"));
});

const fetchMessages = asyncHandler(async (req, res) => {
  const chatId = req.header("chatId");
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat Not Found");
  }

  const messagePromises = chat.messages.map(async (messageId) => {
    return await Message.findById(messageId);
  });

  const messages = await Promise.all(messagePromises);

  return res.status(200).json(new ApiResponse(200, messages, "Success"));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, content } = req.body;

  if (!chatId || !senderId || !content) {
    throw new ApiError(400, "Every field are required");
  }

  const sender = await User.findById(senderId);

  if (!sender) {
    throw new ApiError(404, "User Not Found");
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, "Chat Not Found");
  }

  const message = await Message.create({ sender: senderId, content });
  chat.messages.push(message);
  chat.lastmessage = content;
  await chat.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "New message send Added"));
});

export { createNewChat, fetchChat, fetchMessages, sendMessage};
