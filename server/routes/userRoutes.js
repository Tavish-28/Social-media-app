import express from "express";
import {
  getUserData,
  updateUserData,
  discoverUser,
  followUser,
  UnfollowUser,
  sendConnectionRequest,
  AcceptConnectionRequest,
  getUserConnections,
} from "../controllers/UserController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../configs/multer.js";

const userRouter = express.Router();
userRouter.get("/data", protect, getUserData);
userRouter.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData,
);
userRouter.get("/discover", protect, discoverUser);
userRouter.post("/follow", protect, followUser);
userRouter.post("/unfollow", protect, UnfollowUser);
userRouter.post("/connect", protect, sendConnectionRequest);
userRouter.post("/accept", protect, AcceptConnectionRequest);
userRouter.post("/connections", protect, getUserConnections);
export default userRouter;
