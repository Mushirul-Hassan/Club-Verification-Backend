import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminSubmissionRoutes from "./routes/adminSubmissionRoutes.js";
// import doorRoutes from './routes/doorRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

//  Rate Limiter: Max 10 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Too many requests, please try again in a minute." },
  validate: { trustProxy: false },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login attempts per 15 mins
  message: { error: "Too many login attempts, try again in 15 minutes." },
  validate: { trustProxy: false },
});

app.use("/api/user", apiLimiter, userRoutes);
app.use("/api/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/admin/submissions", adminSubmissionRoutes);
// app.use('/api/door', apiLimiter, doorRoutes);

app.listen(PORT, () => {
  console.log(`Club API Server running on port ${PORT}`);
});
