const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();
require("./utils/cronjob");
const app = express();

//importing routers:
const authRouter = require("./routes/auth.js");
const requestRouter = require("./routes/requests.js");
const profileRouter = require("./routes/profile.js");
const userRouter = require("./routes/user.js");
const paymentRouter = require("./routes/payment.js");
const initializeSocket = require("./utils/socket.js");
const chatRouter = require("./routes/chat.js");
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? ["http://13.233.53.169/"]
  : ["http://localhost:5173"];

// Middlewares
app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: true, //tells browser to send cookie for cross-origin requests
//   })
// );

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    preflightContinue: false,
  })
);

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE , OPTIONS"
  );
  res.header("credentials", true);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("preflightContinue", false);
  res.sendStatus(200); // Respond to the preflight request
});

// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//   );
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.sendStatus(204); // No Content
// });

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(4000, () => {
      console.log("Listening on port 4000");
    });
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
