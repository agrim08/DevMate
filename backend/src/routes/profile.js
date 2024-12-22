const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const { checkAllowedUpdates } = require("../utils/patchValidUpdates.js");

const profileRouter = express.Router();

//profile api
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!checkAllowedUpdates(req.body)) {
      throw new Error("You are not allowed to update this field");
    }
    const loggedInuser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInuser[key] = req.body[key]));
    await loggedInuser.save();

    res.json({
      message: `${loggedInuser.firstName}, your profile has been updated`,
      data: loggedInuser,
    });
  } catch (err) {
    res.status(403).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
