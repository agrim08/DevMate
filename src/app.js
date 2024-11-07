const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user.js");

const app = express();

// provided middeware to handle reques
app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body);

  //we can send custom ids
  const user = new User(req.body);
  try {
    await user.save();
    res.send("success");
  } catch (err) {
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
