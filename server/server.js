import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messagesRoutes.js";

// dotenv.config();

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
};

// Inngest's GET sync endpoint must be available even if MongoDB is unavailable.
app.use(
  "/api/inngest",
  (req, res, next) => {
    if (req.method === "GET") return next();
    return requireDatabase(req, res, next);
  },
  serve({
    client: inngest,
    functions,
  }),
);

// Clerk AFTER
app.use(clerkMiddleware());

app.use("/api/user", requireDatabase, userRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/post", requireDatabase, postRouter);
app.use("/api/story", requireDatabase, storyRouter);
app.use("/api/message", requireDatabase, messageRouter);
const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Unable to start server:", error);
      process.exit(1);
    });
}

export default app;
