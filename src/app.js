import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import helmet from "helmet";
import config from "./config/index.js";
import "./utils/cronjob.js";
import initializeSocket from "./utils/socket.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import requestRouter from "./routes/request.routes.js";
import profileRouter from "./routes/profile.routes.js";
import userRouter from "./routes/user.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import chatRouter from "./routes/chat.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import githubRouter from "./routes/github.routes.js";

const app = express();

// Enable trust proxy for Render/Vercel (needed for secure cookies)
app.set("trust proxy", 1);


// Security HTTP headers
app.use(helmet());

// Logging
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Set up CORS
const allowedOrigins = [
  "http://localhost:5173",
  config.frontendUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`); // Log the blocked origin for debugging
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  })
);

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Route Declarations
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", paymentRouter);
app.use("/api", chatRouter);
app.use("/api", uploadRouter);
app.use("/api/github", githubRouter);


// Global Error Handler
app.use(errorHandler);

const server = http.createServer(app);
initializeSocket(server);

export { server };
