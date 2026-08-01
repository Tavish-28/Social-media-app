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
    },
    bio: {
      type: String,
      default: "hey tere i am using messag",
    },
    profile_picture: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, minimize: false },
);

const User = mongoose.model("User", userSchema);
export default User;
