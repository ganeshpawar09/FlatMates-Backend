import { Router } from "express";
import { logout, sendOpt, verify } from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userRouter = Router();

userRouter.route("/send-otp").post(sendOpt);
userRouter.route("/verify-otp").post(verify);

// secure routes

userRouter.route("/logout").post(verifyAccessToken, logout);

userRouter.get("/access-token-verify", verifyAccessToken, (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Access Token is Valid"));
});

export default userRouter;
