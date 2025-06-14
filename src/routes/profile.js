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
    if (!checkAllowedUpdates(req?.body)) {
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
    console.error(err.message); // Log the error message for debugging
    res.status(403).send("ERROR : " + err.message);
  }
});

profileRouter.post("/complete-profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { userAge, gender, bio, skills, photoUrl } = req.body;

    if (!userAge || isNaN(parseInt(userAge))) {
      return res.status(400).json({ error: "Age must be a valid number" });
    }
    const age = parseInt(userAge);

    if (!gender || !["male", "female", "others"].includes(gender.toLowerCase())) {
      return res.status(400).json({ error: "Gender must be male, female, or others" });
    }

    if (!bio || typeof bio !== "string" || bio.length < 20 || bio.length > 150) {
      return res.status(400).json({ error: "Bio must be a string between 20 and 150 characters" });
    }

    if (!skills || typeof skills !== "string") {
      return res.status(400).json({ error: "Skills must be a comma-separated string" });
    }
    const skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
    if (skillsArray.length === 0) {
      return res.status(400).json({ error: "Please provide at least one skill" });
    }

    if (photoUrl && !validator.isURL(photoUrl)) {
      return res.status(400).json({ error: "Invalid photo URL" });
    }

    user.userAge = age;
    user.gender = gender.toLowerCase();
    user.bio = bio;
    user.skills = skillsArray;
    if (photoUrl) user.photoUrl = photoUrl;

    await user.save();

    console.log(user)

    res.json({
      message: "Profile completed successfully",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while completing the profile" });
  }
});



module.exports = profileRouter;
