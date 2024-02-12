import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    gender: {
      type: String,
      require: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    favouriteFlats: [{ type: Schema.Types.ObjectId, ref: "Flat" }],
    ownflats: [{ type: Schema.Types.ObjectId, ref: "Flat" }],

    accessToken: {
      type: String,
    },
  },
  { timeseries: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      phoneNumber: this.phoneNumber,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
