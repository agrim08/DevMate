import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to authenticate a user based on the JWT token stored in cookies.
 * Attaches the user object to the request if authentication is successful.
 */
const userAuth = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    throw new ApiError(401, "Authentication required. Please login.");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid authentication token. User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid authentication token.");
  }
});

export { userAuth };
