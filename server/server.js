import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import userRouter from "./routes/userRoutes.js";

// dotenv.config();

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Inngest FIRST
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  }),
);

// Clerk AFTER
app.use(clerkMiddleware());

app.use("/api/user", userRouter);

await connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
