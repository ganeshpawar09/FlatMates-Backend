import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  createNewRoom,
  fetchRoom,
  fetchChat,
  sendMessage,
} from "../controllers/chat_controller.js";

const chatRouter = Router();

chatRouter.route("/create-room").post(verifyAccessToken, createNewRoom);
chatRouter.route("/send-message").post(verifyAccessToken, sendMessage);
chatRouter.route("/fetch-room").get(verifyAccessToken, fetchRoom);
chatRouter.route("/fetch-chat").get(verifyAccessToken, fetchChat);

export default chatRouter;
