const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const User = require("./models/user.js");
const { checkAllowedUpdates } = require("./utils/patchValidUpdates.js");
const { signUpValidation } = require("./utils/signUpValidtation.js");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth.js");

const app = express();

//importing routers:
const authRouter = require("./routes/auth.js");
const requestRouter = require("./routes/requests.js");
const profileRouter = require("./routes/profile.js");

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
// Connect to the database and start the server
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
