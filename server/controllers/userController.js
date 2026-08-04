import User from "../models/User.js";

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

    // await User.findByIdAndUpdate(userId, updatedUser);
    // res.json({
    //   success: true,
    //   message: "User data updated successfully",
    // });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};
