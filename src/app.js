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

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

// Endpoint to create a new user
app.post("/signup", async (req, res) => {
  try {
    //Validation:
    signUpValidation(req);

    //encryption:
    const {
      firstName,
      lastName,
      emailId,
      password,
      bio,
      DateOfBirth,
      gender,
      skills,
      photoUrl,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    //* console.log(passwordHash);

    //storing
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      photoUrl,
      skills,
      gender,
      bio,
      DateOfBirth,
    });
    await user.save();
    res.send("User created successfully");
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send(err.message);
    }
  }
});

//login api
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isValidPassword = user.validatePassword(password);

    if (isValidPassword) {
      //jwt token created
      const token = user.getJWT();

      //cookie parser
      res.cookie("token", token, {
        expires: new Date(Date.now() + 1 * 3600000), //cookie will expire in 1 hr
      });
      res.send("Login successful");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

//profile api
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

//Send connect request
app.post("/sendconnectionrequest", userAuth, async (req, res) => {
  const user = req.user;

  console.log("Connect request sent");
  res.send(user.firstName + " sent a connection request");
});

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
