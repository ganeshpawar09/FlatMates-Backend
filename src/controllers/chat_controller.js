import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message_model.js";
import { User } from "../models/user.model.js";

const createNewRoom = asyncHandler(async (req, res) => {
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
  let room = await Room.findOne({
    $or: [
      { customId: `${userId + ownerId}` },
      { customId: `${ownerId + userId}` },
    ],
  });
  if (room) {
    res.status(200).json(new ApiResponse(200, room, "Room already exist"));
  }
  const newId = `${userId + ownerId}`;
  room = await Room.create({
    name: `${user.name} and ${owner.name}`,
    customId: newId,
    messages: [],
  });

  if (room) {
    user.rooms.push(room);
    owner.rooms.push(room);
    await user.save();
    await owner.save();
    return res.status(200).json(new ApiResponse(200, room, "New Room created"));
  }
});
const fetchRoom = asyncHandler(async (req, res) => {
  const userId = req.header("userId");
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  const roomPromises = user.rooms.map(async (roomId) => {
    return await Room.find(roomId);
  });

  const rooms = await Promise.all(roomPromises);

  return res.status(200).json(new ApiResponse(200, rooms, "Success"));
});

const fetchChat = asyncHandler(async (req, res) => {
  const roomId = req.header("roomId");
  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room Not Found");
  }

  const messagePromises = room.messages.map(async (messageId) => {
    return await Message.findById(messageId);
  });

  const messages = await Promise.all(messagePromises);

  return res.status(200).json(new ApiResponse(200, messages, "Success"));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { roomId, senderId, content } = req.body;

  if (!roomId || !senderId || !content) {
    throw new ApiError(400, "Every field are required");
  }

  const sender = await User.findById(senderId);

  if (!sender) {
    throw new ApiError(404, "User Not Found");
  }
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Room Not Found");
  }

  const message = await Message.create({ sender: senderId, content });
  room.messages.push(message);
  room.lastmessage = content;
  await room.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "New message send Added"));
});

export { createNewRoom, fetchRoom, fetchChat, sendMessage };
