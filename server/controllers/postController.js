import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
//Add post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;

    let image_urls = [];

    if (images?.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);

          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });

          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });

          return url;
        }),
      );
    }
    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });
    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findOne({ id: userId }).select("following");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
    const posts = await Post.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .lean();

    const authors = await User.find({ id: { $in: userIds } }).lean();
    const authorsById = new Map(authors.map((author) => [author.id, author]));
    const postsWithAuthors = posts.map((post) => ({
      ...post,
      user: authorsById.get(post.user) ?? null,
    }));
    res.json({ success: true, posts: postsWithAuthors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
//Like posts
export const likePosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const postId = req.params.postId || req.body?.postId;

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      res.json({ success: true, liked: false, message: "Post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      res.json({ success: true, liked: true, message: "Post liked" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
