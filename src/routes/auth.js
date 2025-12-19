const express = require("express");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { signUpValidation } = require("../utils/signUpValidtation.js"); // Fixed typo in filename
const { userAuth } = require("../middlewares/auth.js");
const generateOTP = require("../utils/generateOTP.js");
const sendOTPEmail = require("../utils/sendOTPEmail.js");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    signUpValidation(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      emailOTP: otp,
      emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    await user.save();

    await sendOTPEmail(emailId, otp);

    res.status(201).json({
      message: "OTP sent to email. Please verify.",
    });
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
    if (!user.emailVerified) {
      throw new Error("Please verify your email first");
    }
    const isValidPassword = await user.validatePassword(password);
    if (isValidPassword) {
      // JWT token created
      const token = await user.getJWT();

      // Cookie parser
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), 
      });

      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.log(error); 
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

authRouter.post("/verify-email", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) throw new Error("User not found");

    if (user.emailVerified)
      throw new Error("Email already verified");

    if (
      user.emailOTP !== otp ||
      user.emailOTPExpires < Date.now()
    ) {
      throw new Error("Invalid or expired OTP");
    }

    user.emailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});


module.exports = authRouter;
