const express = require("express");

const app = express();

app.get("/adminInfo", (req, res) => {
  // if an error came:
  try {
    throw new Error("random error");
    console.log("success");
    res.send("fetched admin info");
  } catch (error) {
    res.status(500).send("something went wrong, contact support team");
  }
});

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("something went wrong");
  }
});

app.listen(7000, () => {
  console.log("server is listening");
});
