import { checkAllowedUpdates } from "../utils/patchValidUpdates.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import validator from "validator";

/**
 * Retrieves the profile of the current logged-in user.
 */
const viewProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile retrieved successfully"));
});

/**
 * Updates the profile of the current logged-in user.
 */
const editProfile = asyncHandler(async (req, res) => {
  if (!checkAllowedUpdates(req?.body)) {
    throw new ApiError(403, "Update failed. Some fields are not allowed to be updated.");
  }

  const user = req.user;
  Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
  
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, `${user.firstName}, your profile has been updated successfully`));
});

/**
 * Completes the user profile with age, gender, bio, skills, etc.
 */
const completeProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { userAge, gender, bio, skills, photoUrl } = req.body;

  if (!userAge || isNaN(parseInt(userAge))) {
    throw new ApiError(400, "Age must be a valid number");
  }
  const age = parseInt(userAge);

  if (!gender || !["male", "female", "others"].includes(gender.toLowerCase())) {
    throw new ApiError(400, "Gender must be male, female, or others");
  }

  if (!bio || typeof bio !== "string" || bio.length < 20 || bio.length > 150) {
    throw new ApiError(400, "Bio must be a string between 20 and 150 characters");
  }

  if (!skills || typeof skills !== "string") {
    throw new ApiError(400, "Skills must be a comma-separated string");
  }

  const skillsArray = skills.split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);

  if (skillsArray.length === 0) {
    throw new ApiError(400, "Please provide at least one skill");
  }

  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new ApiError(400, "Invalid photo URL");
  }

  user.userAge = age;
  user.gender = gender.toLowerCase();
  user.bio = bio;
  user.skills = skillsArray;
  if (photoUrl) user.photoUrl = photoUrl;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile completed successfully"));
});

export { viewProfile, editProfile, completeProfile };
