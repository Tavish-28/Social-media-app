import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      default: "",
    },
    bio: {
      type: String,
      default: "Hey there! I am using Messag.",
    },
    profile_picture: {
      type: String,
      default: "",
    },
    cover_photo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: String,
      },
    ],
    following: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
