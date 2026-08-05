import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Connection from "../models/connection.js";
// Get User Data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    // console.log("hi" + userId);

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // console.log(user);

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

// Update User Data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findOne({ id: userId });

    if (!tempUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        username = tempUser.username;
      }
    }

    const updatedUser = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      updatedUser.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "50" },
          { format: "webp" },
          { width: "512" },
        ],
      });
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      updatedUser.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "50" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const user = await User.findOneAndUpdate({ id: userId }, updatedUser, {
      new: true,
    });

    res.json({
      success: true,
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Discover Users
export const discoverUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input = "" } = req.query;

    const users = await User.find({
      id: { $ne: userId },
      $or: [
        { username: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Follow User
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findOne({ id: userId });
    const toUser = await User.findOne({ id });

    if (!user || !toUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "Already following this user",
      });
    }

    user.following.push(id);
    toUser.followers.push(userId);

    await user.save();
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

// Unfollow User
export const UnfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findOne({ id: userId });
    const toUser = await User.findOne({ id });

    if (!user || !toUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    user.following = user.following.filter((item) => item !== id);
    toUser.followers = toUser.followers.filter((item) => item !== userId);

    await user.save();
    await toUser.save();

    res.json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // Check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequests = await Connection.find({
      from_user_id: userId,
      status: "pending",
      createdAt: { $gte: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have reached the limit of 20 connection requests in the last 24 hours",
      });
    }
    //CHECK IF CONNECTION REQUEST ALREADY EXISTS
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });
    if (!connection) {
      await connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      return res.json({
        success: true,
        message: "Connection request sent successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
//Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findOne(userId).populate("connections");
    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;
    const pendingConnections = (
      await Connection.find({ to_user_id: userId, status: "pending" }).populate(
        "from_user_id",
      )
    ).map((connection) => connection.from_user_id);
    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
//Accept connection request
export const AcceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body();
    const connection = await Connection.findOne({
      form_user_id: id,
      to_user_id: user_id,
    });
    if (!connection) {
      return res.json({ success: false, message: "connection not found" });
    }
    const user = await User.findOne(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findOne(id);
    toUser.connections.push(userId);
    await toUser.save();
    connection.status = "accepted";
    await connection.save();
    res.json({ success: true, message: "Connection accepted successfully   " });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
