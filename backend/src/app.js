const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

//importing routers:
const authRouter = require("./routes/auth.js");
const requestRouter = require("./routes/requests.js");
const profileRouter = require("./routes/profile.js");
const userRouter = require("./routes/user.js");

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    app.listen(4000, () => {
      console.log("Listening on port 4000");
    });
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
