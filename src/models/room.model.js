import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export const Room = mongoose.model("Room", roomSchema);
