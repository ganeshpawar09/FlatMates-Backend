import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message_model.js";
import { User } from "../models/user.model.js";

const createNewChat = asyncHandler(async (req, res) => {
  const { userId, ownerId } = req.body;
  if (!userId || !ownerId) {
    throw new ApiError(400, "userId and ownerId is required");
  }

  const user = await User.findById(userId);
  const owner = await User.findById(ownerId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  if (!owner) {
    throw new ApiError(404, "Owner Not Found");
  }
  let chat = await Chat.findOne({
    $or: [
      { customId: `${userId + ownerId}` },
      { customId: `${ownerId + userId}` },
    ],
  });
  if (chat) {
    res.status(200).json(new ApiResponse(200, chat, "Chat already exist"));
  }
  const newId = `${userId + ownerId}`;
  chat = await Chat.create({
    name: `${user.name} and ${owner.name}`,
    customId: newId,
    messages: [],
  });

  if (chat) {
    user.chats.push(chat);
    owner.chats.push(chat);
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
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new ApiError(404, `Chat with id ${chatId} not found`);
    }

    const messagePromises = chat.messages.map(async (messageId) => {
      return await Message.findById(messageId);
    });

    const message = await Promise.all(messagePromises);
    chat.messages = message;

    return {
      chat,
    };
  });

  const chats = await Promise.all(chatPromises);

  return res.status(200).json(new ApiResponse(200, chats, "Success"));
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

export { createNewChat, fetchChat, sendMessage };
