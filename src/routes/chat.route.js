import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  createNewChat,
  fetchChat,
  sendMessage,
} from "../controllers/chat_controller.js";

const chatRouter = Router();

chatRouter.route("/create-chat").post(verifyAccessToken, createNewChat);
chatRouter.route("/send-message").post(verifyAccessToken, sendMessage);
chatRouter.route("/fetch-chat").get(verifyAccessToken, fetchChat);

export default chatRouter;
