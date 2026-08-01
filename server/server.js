import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "dotenv";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./routes/ingest.js";

const app = express();
await connectDB();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/inngest", serve({ client: inngest, fuctions }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
