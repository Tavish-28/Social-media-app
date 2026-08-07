import fs from "fs";
import imagekit from "../configs/imagekit";
import Post from "../models/Post";
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
    const user = await User.findById(userId);
    //User connection and following
    const userIds = [userId, ...user.connection, ...user.following];
    const posts = await Post.find({ user: { $in: userId } })
      .populate("user")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: true, message: error.message });
  }
};
//Like posts
export const likePosts = async (res, req) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (post.likes_count.include(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      res.json({ success: true, message: "POst unliked " });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: true, message: error.message });
  }
};
