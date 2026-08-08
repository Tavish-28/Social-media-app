import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Connection from "../models/Connection.js";
import { inngest } from "../inngest/index.js";
import Post from "../models/Post.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    const { username: submittedUsername, bio, location, full_name } = req.body;

    const tempUser = await User.findOne({ id: userId });

    if (!tempUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const username = submittedUsername?.trim() || tempUser.username;

    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "That username is already in use",
        });
      }
    }

    const updatedUser = { username };

    for (const [field, value] of Object.entries({ bio, location, full_name })) {
      if (typeof value === "string") {
        updatedUser[field] = value.trim();
      }
    }

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
    const input = typeof req.query.input === "string" ? req.query.input : "";
    const searchTerm = escapeRegExp(input.trim().slice(0, 100));

    const users = await User.find({
      id: { $ne: userId },
      $or: [
        { username: new RegExp(searchTerm, "i") },
        { full_name: new RegExp(searchTerm, "i") },
        { email: new RegExp(searchTerm, "i") },
        { location: new RegExp(searchTerm, "i") },
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

    if (!id || id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

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

    await Promise.all([
      User.updateOne({ id: userId }, { $addToSet: { following: id } }),
      User.updateOne({ id }, { $addToSet: { followers: userId } }),
    ]);

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

    if (!id || id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const user = await User.findOne({ id: userId });
    const toUser = await User.findOne({ id });

    if (!user || !toUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    await Promise.all([
      User.updateOne({ id: userId }, { $pull: { following: id } }),
      User.updateOne({ id }, { $pull: { followers: userId } }),
    ]);

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

    if (!id || id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    const [fromUser, toUser] = await Promise.all([
      User.findOne({ id: userId }), // jo bhej raha hai
      User.findOne({ id }), //jise bheja
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequests = await Connection.countDocuments({
      from_user_id: userId,
      createdAt: { $gte: last24Hours },
    });
    if (connectionRequests >= 20) {
      return res.status(429).json({
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
    if (connection) {
      return res.status(409).json({
        success: false,
        message:
          connection.status === "accepted"
            ? "You are already connected"
            : "A connection request already exists",
      });
    }

    const newConnection = await Connection.create({
      from_user_id: userId,
      to_user_id: id,
    });

    // A notification problem should not undo a successfully stored request.
    await inngest
      .send({
        name: "app/connection-request",
        data: { connectionId: newConnection.id },
      })
      .catch((error) =>
        console.error("Could not queue connection email:", error),
      );

    return res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
    });
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
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const [acceptedConnections, pendingRequests] = await Promise.all([
      Connection.find({
        status: "accepted",
        $or: [{ from_user_id: userId }, { to_user_id: userId }],
      }).lean(),
      Connection.find({ to_user_id: userId, status: "pending" }).lean(),
    ]);

    const connectionIds = acceptedConnections.map((connection) =>
      connection.from_user_id === userId
        ? connection.to_user_id
        : connection.from_user_id,
    );
    const pendingIds = pendingRequests.map(
      (connection) => connection.from_user_id,
    );
    const people = await User.find({
      id: { $in: [...connectionIds, ...pendingIds] },
    });
    const peopleById = new Map(people.map((person) => [person.id, person]));

    const connections = connectionIds
      .map((id) => peopleById.get(id))
      .filter(Boolean);
    const pendingConnections = pendingIds
      .map((id) => peopleById.get(id))
      .filter(Boolean);
    res.json({
      success: true,
      connections,
      followers: user.followers,
      following: user.following,
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
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;
    if (!id || id === userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection request",
      });
    }

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
      status: "pending",
    });
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    const [fromUser, toUser] = await Promise.all([
      User.findOne({ id }),
      User.findOne({ id: userId }),
    ]);
    if (!fromUser || !toUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    connection.status = "accepted";
    await connection.save();
    res.json({ success: true, message: "Connection accepted successfully" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//get user profiles
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { profile_id } = req.body();
    const profile = await User.findById(profile_id);
    if (!profile) {
      return res.json({ success: false, message: "Profiles not found" });
    }
    const posts = await Post.find({ user: profile_id }).populate("user");
    res.json({ success: true, profile, posts });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
