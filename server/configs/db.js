import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(`${process.env.MONGODB_URL}/social_media_app`)
      .then((connection) => {
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};
export default connectDB;
