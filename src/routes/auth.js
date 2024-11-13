const express = require("express");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth.js");
const { signUpValidation } = require("../utils/signUpValidtation.js");

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
        // expires: new Date(Date.now() + 1 * 3600000), //cookie will expire in 1 hr
      });

      res.send("Login successful");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = authRouter;
