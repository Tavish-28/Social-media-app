import express from "express";
import {
  getUserData,
  updateUserData,
  discoverUser,
  followUser,
  UnfollowUser,
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

export default userRouter;
