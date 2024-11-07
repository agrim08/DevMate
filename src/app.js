const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user.js");
const app = express();
// provided middeware to handle reques
app.use(express.json());

app.post("/signup", async (req, res) => {
  //we can send custom ids also
  const user = new User(req.body);
  try {
    await user.save();
    res.send("success");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

//get user by emailId
app.get("/user", async (req, res) => {
  try {
    const users = await User.find({ emailId: req.body.emailId });
    if (users.length === 0) res.status(404).send("User not found");
    else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

//getting all users:
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("user deleted");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    app.listen(4000, () => {
      console.log("listening on port 4000");
    });
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Connection failed");
  });
