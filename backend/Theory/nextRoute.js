const express = require("express");

const app = express();

app.use("/user", [
  //we can send array of route handlers
  (req, res, next) => {
    console.log("hello");
    // res.send("hello from 1st route handler");
    next();
  },
  (req, res, next) => {
    console.log("hello 2nd");
    // res.send("hello from 2nd route handler");
    next();
  },
  (req, res) => {
    console.log("hello 3rd");
    res.send("hello from 3rd route handler");
  },
]);

app.listen(4000, () => {
  console.log("listening on port 4000");
});
