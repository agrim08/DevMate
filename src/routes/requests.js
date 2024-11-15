const express = require("express");
const User = require("../models/user.js");
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const ALLOWED_STATUS = ["interested", "ignored"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).send("Invalid status type");
      }

      if (fromUserId.toString() === toUserId.toString()) {
        return res.status(400).send("Invalid connection request");
      }

      const recieverUser = await User.findById(toUserId);

      if (!recieverUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        throw new Error("Connection request has already been sent");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          status === `interested`
            ? `Connection Request to ${recieverUser.firstName} has been sent`
            : `Connection Request to ${recieverUser.firstName} has been ignored`,
        data: status === `interested` ? data : null,
      });
    } catch (err) {
      res.status(500).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;

      const loggedInUser = req.user;
      const ALLOWED_STATUS = ["accepted", "rejected"];

      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message:
          status === "accepted"
            ? `Connection request accepted`
            : `Connection request rejected`,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR :" + error.message);
    }
  }
);

module.exports = requestRouter;
