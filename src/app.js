const express = require("express");

const app = express();

app.use("/user", (req, res, next) => {
  res.send("hello from route handler");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
