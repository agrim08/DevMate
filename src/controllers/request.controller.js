import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { startOfDay, endOfDay } from "date-fns";
import { connectionLimits } from "../utils/constants.js";
import { run as sendEmailRun } from "../utils/sendEmail.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Sends a connection request to another user.
 */
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const fromUser = req.user;
  const { status, toUserId } = req.params;

  const ALLOWED_STATUS = ["interested", "ignored"];
  if (!ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, "Invalid status type: " + status);
  }

  // Check connection request limits for "interested" status only
  if (status === "interested") {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const requestCount = await ConnectionRequest.countDocuments({
      fromUserId: fromUser._id,
      status: "interested",
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const userTier = fromUser.membershipType || "free";
    const limit = connectionLimits[userTier];

    if (requestCount >= limit) {
      throw new ApiError(
        403,
        `Daily connection limit reached for ${userTier} tier. Upgrade to send more requests.`
      );
    }
  }

  if (fromUser._id.toString() === toUserId.toString()) {
    throw new ApiError(400, "You cannot send a connection request to yourself");
  }

  const receiverUser = await User.findById(toUserId);
  if (!receiverUser) {
    throw new ApiError(404, "Target user not found");
  }

  const existingConnectionRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: fromUser._id, toUserId },
      { fromUserId: toUserId, toUserId: fromUser._id },
    ],
  });

  if (existingConnectionRequest) {
    throw new ApiError(400, "Connection request already exists between these users");
  }

  const connectionRequest = new ConnectionRequest({
    fromUserId: fromUser._id,
    toUserId,
    status,
  });

  const data = await connectionRequest.save();

  // Send notification email via SES
  if (status === "interested") {
    const subject = `New connection request from ${fromUser.firstName}`;
    const body = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #6366f1;">New Connection Request</h2>
        <p>Hi ${receiverUser.firstName},</p>
        <p><strong>${fromUser.firstName}</strong> has sent you a connection request on DevMate!</p>
        <p>Log in to your account to respond to the request.</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/requests" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request</a>
        </div>
      </div>
    `;
    
    try {
      await sendEmailRun(subject, body);
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // We don't throw here to ensure the request is still saved even if email fails
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, `Connection request ${status} successfully`));
});

/**
 * Reviews (accepts or rejects) a received connection request.
 */
const reviewConnectionRequest = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { status, requestId } = req.params;

  const ALLOWED_STATUS = ["accepted", "rejected"];
  if (!ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, "Invalid status type: " + status);
  }

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  });

  if (!connectionRequest) {
    throw new ApiError(404, "Pending connection request not found");
  }

  connectionRequest.status = status;
  const data = await connectionRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, data, `Connection request ${status} successfully`));
});

export { sendConnectionRequest, reviewConnectionRequest };
