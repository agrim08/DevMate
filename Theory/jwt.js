const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const User = require("./models/user.js");
const { checkAllowedUpdates } = require("./utils/patchValidUpdates.js");
const { signUpValidation } = require("./utils/signUpValidtation.js");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/userAuth.js");

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
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      //jwt token created
      const token = await jwt.sign({ _id: user._id }, "!&DEV#Mate!&");

      //cookie parser
      res.cookie("token", token);
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

// Endpoint to get user by emailId
app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });
    if (!user) res.status(404).send("User not found");
    else res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// Endpoint to get all users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

// Endpoint to delete a user by ID
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

// Endpoint to update a user by ID
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const isAllowed = checkAllowedUpdates(data);
    if (!isAllowed) throw new Error("update is not allowed");
    const newUser = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
      returnDocument: "after",
      lean: true,
    });
    res.send("User updated");
  } catch (err) {
    res.status(500).send(err.message);
  }
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
