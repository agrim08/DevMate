const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("Hello from DevMate");
});

app.use("/about", (req, res) => {
  res.send("Hello from About page");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
