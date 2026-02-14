import User from "../models/user.js";
import bcrypt from "bcrypt";
import { signUpValidation } from "../utils/signUpValidation.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import config from "../config/index.js";

/**
 * Handles user registration.
 */
const signup = asyncHandler(async (req, res) => {
  signUpValidation(req);

  const { firstName, lastName, emailId, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    emailId,
    password: passwordHash,
    emailVerified: true // Auto-verify email for now as per previous logic
  });

  try {
    await user.save();
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Account created successfully. Please login."));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "User with this email already exists");
    }
    throw error;
  }
});

/**
 * Handles user login.
 */
const login = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ emailId });
  if (!user) {
    throw new ApiError(401, "Invalid credentials or user not found");
  }

  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = await user.getJWT();

  const options = {
    expires: new Date(Date.now() + 8 * 3600000),
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, user, "Login successful"));
});

/**
 * Handles user logout.
 */
const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

/**
 * Handles password reset for logged-in users.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, { password: hashPassword });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Your password has been updated"));
});

/**
 * Verifies user email via OTP.
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { emailId, otp } = req.body;

  if (!emailId || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ emailId });

  if (!user) throw new ApiError(404, "User not found");

  if (user.emailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (user.emailOTP !== otp || user.emailOTPExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.emailVerified = true;
  user.emailOTP = undefined;
  user.emailOTPExpires = undefined;

  await user.save();

  const token = await user.getJWT();

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 8 * 3600000),
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, user, "Email verified successfully"));
});

export { signup, login, logout, forgotPassword, verifyEmail };
