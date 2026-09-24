import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import rankingRoutes from "./routes/rankingRoutes.js";

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || ["http://localhost:5173", "https://javascript-clock-project-2d9v.vercel.app"],
    credentials: true,
  })
);

// Body size limit
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts. Please try again later." },
});

app.get("/", (req, res) => res.send("Rank Pilot API is running"));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/rankings", rankingRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
