const express = require("express");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { signUpValidation } = require("../utils/signUpValidtation.js");
const { userAuth } = require("../middlewares/auth.js");

const authRouter = express.Router();

// Endpoint to create a new user
authRouter.post("/signup", async (req, res) => {
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
    const newUser = await user?.save();
    const token = await newUser?.getJWT();

    //cookie parser
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), //cookie will expire in 8 hr
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

//login api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isValidPassword = await user.validatePassword(password);

    if (isValidPassword) {
      //jwt token created
      const token = await user.getJWT();

      //cookie parser
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), //cookie will expire in 8 hr
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
