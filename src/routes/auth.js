const express = require("express");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { signUpValidation } = require("../utils/signUpValidtation.js"); // Fixed typo in filename
const { userAuth } = require("../middlewares/auth.js");

const authRouter = express.Router();

// Endpoint to create a new user
authRouter.post("/signup", async (req, res) => {
  try {
    // Validation
    signUpValidation(req);

    // Encryption
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // Storing
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const newUser = await user.save();
    const token = await newUser.getJWT();

    // Cookie parser
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // Cookie expires in 8 hours
    });
    res.json({ message: "User created successfully", data: newUser });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send(err.message);
    }
  }
});

// Login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isValidPassword = await user.validatePassword(password);

    if (isValidPassword) {
      // JWT token created
      const token = await user.getJWT();

      // Cookie parser
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // Cookie expires in 8 hours
      });

      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logout successful");
});

authRouter.post("/forgotPassword", userAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      throw new Error("New password required");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { password: hashPassword });

    res.send("Your password has been updated");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

module.exports = authRouter;
