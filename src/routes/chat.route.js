import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  createNewChat,
  fetchChat,
  fetchMessages,
  sendMessage,
} from "../controllers/chat_controller.js";

const chatRouter = Router();

chatRouter.route("/create-chat").post(verifyAccessToken, createNewChat);
chatRouter.route("/send-message").post(verifyAccessToken, sendMessage);
chatRouter.route("/fetch-chat").get(verifyAccessToken, fetchChat);
chatRouter.route("/fetch-message").get(verifyAccessToken, fetchMessages);

export default chatRouter;
