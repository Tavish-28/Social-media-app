import fs from "fs";
import imagekit from "../configs/imagekit.js";
import { inngest } from "../inngest/index.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";

// Add user story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = "";
    //upload mediato imagekit
    if ((media_type === "image" || media_type === "video") && !media) {
      return res.status(400).json({
        success: false,
        message: "Media is required for image and video stories",
      });
    }

    if (media_type === "image" || media_type === "video") {
      const fileBuffer = fs.readFileSync(media.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });
      media_url = response.url;
    }
    //create story
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });
    // schedule story deleteion after 24 hrs
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get user stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findOne({ id: userId }).select("following");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const connections = await Connection.find({
      status: "accepted",
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    }).select("from_user_id to_user_id");
    const connectedUserIds = connections.map((connection) =>
      connection.from_user_id === userId
        ? connection.to_user_id
        : connection.from_user_id,
    );

    const userIds = [...new Set([userId, ...user.following, ...connectedUserIds])];
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .sort({ createdAt: -1 })
      .lean();
    const authors = await User.find({ id: { $in: userIds } }).lean();
    const authorsById = new Map(authors.map((author) => [author.id, author]));

    res.json({
      success: true,
      stories: stories.map((story) => ({
        ...story,
        user: authorsById.get(story.user) ?? null,
      })),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
