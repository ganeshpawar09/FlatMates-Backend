import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  customId: {
    type: String,
    required: true,
    unique: true,
  },
  lastmessage: {
    type: String,
  },
  flat: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export const Chat = mongoose.model("Chat", chatSchema);
