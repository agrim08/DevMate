import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { Chat } from "../models/chat.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const POPULATE_DATA_FIELDS = [
  "firstName",
  "lastName",
  "photoUrl",
  "bio",
  "gender",
  "skills",
  "membershipType",
];

/**
 * Gets all pending connection requests for the logged-in user.
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const pendingRequests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", POPULATE_DATA_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, pendingRequests, "Pending requests fetched successfully"));
});

/**
 * Gets all accepted connections for the logged-in user.
 */
const getConnections = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  
  const connections = await ConnectionRequest.find({
    $or: [
      { toUserId: loggedInUser._id, status: "accepted" },
      { fromUserId: loggedInUser._id, status: "accepted" },
    ],
  })
    .populate("fromUserId", POPULATE_DATA_FIELDS)
    .populate("toUserId", POPULATE_DATA_FIELDS);

  const data = await Promise.all(connections.map(async (row) => {
    const user = row.fromUserId._id.toString() === loggedInUser._id.toString()
      ? row.toUserId
      : row.fromUserId;
    
    // Find the chat for this connection and get last message time
    const chat = await Chat.findOne({
      participants: { $all: [loggedInUser._id, user._id] }
    }).select({ messages: { $slice: -1 } }); 
    
    return {
      ...user.toObject(),
      lastMessageAt: chat?.messages?.[0]?.createdAt || row.updatedAt
    };
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Connections fetched successfully"));
});

/**
 * Gets the user feed (users who are not connected and not ignored).
 */
const getUserFeed = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  let limit = parseInt(req.query.limit) || 10;
  limit = limit > 50 ? 50 : limit;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  // Find all connection requests involving the logged-in user
  const connectionRequests = await ConnectionRequest.find({
    $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
  }).select("fromUserId toUserId");

  const hiddenUsersFromFeed = new Set();
  hiddenUsersFromFeed.add(loggedInUser._id.toString());
  
  connectionRequests.forEach((req) => {
    hiddenUsersFromFeed.add(req.fromUserId.toString());
    hiddenUsersFromFeed.add(req.toUserId.toString());
  });

  const users = await User.find({
    _id: { $nin: Array.from(hiddenUsersFromFeed) }
  })
    .select(POPULATE_DATA_FIELDS)
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Feed fetched successfully"));
});

export { getPendingRequests, getConnections, getUserFeed };
