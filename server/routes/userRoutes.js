import express from "express";
import { getUserData, updateUserData } from "../controllers/UserController.js";
import protect from "../middlewares/protect.js";
const userRouter = express.Router();
userRouter.get("/data", protect, getUserData);
userRouter.post("/update", protect, updateUserData);
