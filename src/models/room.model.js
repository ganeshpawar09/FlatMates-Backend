import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
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
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export const Room = mongoose.model("Room", roomSchema);
