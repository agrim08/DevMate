const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

const populateData = [
  "firstName",
  "lastName",
  "photoUrl",
  "bio",
  "gender",
  "skills",
];

userRouter.get("/user/requests/pending", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const pendingConnectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", populateData);
    res.json({
      message: "Connection request fetched Successfully",
      data: pendingConnectionRequest,
    });
  } catch (error) {
    res.status(400).send("ERROR :" + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }).populate("fromUserId", populateData);

    const data = connections.map((row) => row.fromUserId);
    res.json({ data: data });
  } catch (error) {
    res.status(400).send("ERROR :" + error.message);
  }
});

module.exports = userRouter;
