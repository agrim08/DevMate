import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../config/r2.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import config from "../config/index.js";
import User from "../models/user.js";

/**
 * Generates a presigned URL for uploading a profile picture directly to R2.
 * Enforces server-side key generation and basic validation.
 */
const getPresignedUrl = asyncHandler(async (req, res) => {
  const { fileType } = req.query;

  if (!fileType) {
    throw new ApiError(400, "fileType query parameter is required (e.g., image/jpeg)");
  }

  // Strict MIME validation
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(fileType)) {
    throw new ApiError(400, "Unsupported file type. Only JPEG, PNG, and WebP are allowed.");
  }

  const userId = req.user._id;
  const extension = fileType.split("/")[1];
  const fileKey = `profiles/${userId}/photo-${Date.now()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: fileKey,
    ContentType: fileType,
    CacheControl: "public, max-age=31536000, immutable", // 1 year cache
  });

  // URL expires in 60 seconds
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { uploadUrl, fileKey },
      "Presigned URL generated successfully. Valid for 60 seconds."
    )
  );
});

/**
 * Updates the user's photoUrl in the database after successful R2 upload.
 * Uses the custom CDN domain if configured.
 */
const saveProfilePicture = asyncHandler(async (req, res) => {
  const { fileKey } = req.body;

  if (!fileKey) {
    throw new ApiError(400, "fileKey is required");
  }

  // Construct the public URL (favoring CDN if available)
  let baseUrl = config.r2.cdnUrl 
    ? config.r2.cdnUrl 
    : `https://${config.r2.bucketName}.${config.r2.accountId}.r2.cloudflarestorage.com`;
  
  // Ensure baseUrl doesn't end with slash before appending
  baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure we have a protocol
  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  const photoUrl = `${baseUrl}/${fileKey}`;

  // Update user in DB
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { photoUrl },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Profile picture updated successfully")
  );
});

export { getPresignedUrl, saveProfilePicture };
