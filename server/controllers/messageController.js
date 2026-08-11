import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Message from "../models/message.js";
import User from "../models/User.js";

// Create an empty object to store SSE Event connections
const connections = {};

// Controller function for the SSE endpoint
export const sseController = (req, res) => {
  const { userId } = req.params;

  console.log("New client connected :", userId);

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Add the client's response object to the connections object
  connections[userId] = res;
  // res.write() sends data to the client without closing the connection.
  res.write("log: Connected to SSE stream\n\n");

  // Handle client disconnection
  req.on("close", () => {
    // Remove the client's response object from the connections array
    delete connections[userId];

    console.log("Client disconnected");
  });
};

//Send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text = "" } = req.body;
    const image = req.file;

    if (!to_user_id || (!text.trim() && !image)) {
      return res.status(400).json({
        success: false,
        message: "A recipient and either text or an image are required",
      });
    }

    const recipient = await User.findOne({ id: to_user_id }).select("id");
    if (!recipient) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);

      const response = await imagekit.upload({
        //Your server uploads the image:
        file: fileBuffer,
        fileName: image.originalname, //ImageKit returns something like:  //https://ik.imagekit.io/your_id/messages/photo.jpg
      });

      media_url = imagekit.url({
        //Then you store only this URL in MongoDB:
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }
    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });
    //send message to_user_id using sse
    const messageWithUserData =
      await Message.findById(message._id);

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
//get chatmessages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    if (!to_user_id) {
      return res.status(400).json({
        success: false,
        message: "A recipient is required",
      });
    }

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        {
          from_user_id: to_user_id,
          to_user_id: userId,
        },
      ],
    }).sort({ createdAt: -1 });
    //mark mesaae as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const getUserRecentMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const recentByUserId = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.from_user_id === userId
          ? message.to_user_id
          : message.from_user_id;

      if (!recentByUserId.has(otherUserId)) {
        recentByUserId.set(otherUserId, message);
      }
    });

    const otherUserIds = [...recentByUserId.keys()];
    const users = await User.find({ id: { $in: otherUserIds } }).lean();
    const usersById = new Map(users.map((user) => [user.id, user]));

    res.json({
      success: true,
      messages: [...recentByUserId.entries()]
        .map(([otherUserId, message]) => ({
          ...message,
          user: usersById.get(otherUserId) ?? null,
        }))
        .filter((message) => message.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
