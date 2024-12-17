const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");

const app = express();
app.use("/admin", adminAuth);

app.get("/user", userAuth, (req, res) => {
  res.send("user data");
});

app.get("/admin/getAdmin", (req, res) => {
  res.send("getting admin successfull");
});

app.get("/admin/fetchAllData", (req, res) => {
  res.send("fetched data");
});

app.get("/admin/profile", (req, res) => {
  res.send("admin profile");
});

app.listen(7000, () => {
  console.log("listening");
});
