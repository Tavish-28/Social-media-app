import imagekit from "../configs/imagekit";
import { inngest } from "../inngest";
import Story from "../models/Story";

// Add user story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body();
    const media = req.file;
    let media_url = "";
    //upload mediato imagekit
    if (media_type == "image" || media_type == "video") {
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
    // schedule story
    await inngest.send({});
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
    const user = await User.findOne(userId);

    //user connections and following
    const userIds = [userId, ...user.connections, ...user.following];
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
