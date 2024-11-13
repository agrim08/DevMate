const express = require("express");
const User = require("../models/user.js");
const { userAuth } = require("../middlewares/auth.js");

const requestRouter = express.Router();

//Send connect request
requestRouter.post("/sendconnectionrequest", userAuth, async (req, res) => {
  //*! #################
  const { emailId } = req.body;
  const user = await User.findOne({ emailId: emailId });

  console.log("Connection request sent");
  res.send("You send a connection request to " + user.firstName);
});

module.exports = requestRouter;
