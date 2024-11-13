const express = require("express");
const { userAuth } = require("../middlewares/auth.js");

const profileRouter = express.Router();

//profile api
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

module.exports = profileRouter;
