import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import { uploadFile } from "../utils/uploadFile.js";
import { upload } from "../configs/multer.js";
import { format } from "path";

// Get User Data using userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Data using userId
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { username, bio, location, full_name } = req.body;

    const TempUser = await User.findById(userId);
    !username && (username = TempUser.username);
    if (TempUser.username !== username) {
      //user has provided new username
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        // return res.json({
        //   success: false,
        //   message: "Username already taken",
        // });
        username = TempUser.username;
      }
    }
    const updatedUser = {
      username,
      bio,
      location,
      full_name,
    };
    const profile = req.file.profile && req.file.profile[0];
    const cover = req.file.cover && req.file.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imageKit.url({
        path: response.filePath,
        transformation: [{ quality: 50 }, { format: "webp" }, { width: 512 }],
      });
      updatedData.profile_photo = url;
    }
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      const url = imageKit.url({
        path: response.filePath,
        transformation: [{ quality: 50 }, { format: "webp" }, { width: 1280 }],
      });
      updatedData.cover_photo = url;
    }
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    res.json({
      success: true,
      user,
      message: "User data updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Data using username
export const discoverUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;
    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });
    const filteredUsers = allUsers.filter((user) => user._id !== userId);

    res.json({
      success: true,
      users: filteredUsers,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

//follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;
    const user = await User.findById(userId);
    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }
    user.following.push(id);
    await user.save();
    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();
    res.json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

//unfollow a user
export const UnfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;
    const user = await User.findById(userId);
    user.following = user.following.filter((user) => user !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter((user) => user !== userId);
    await toUser.save();

    res.json({
      success: true,
      message: "Now you are not following this user",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};
