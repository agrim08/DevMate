const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send({
    name: "Agrim",
    age: 19,
  });
});

app.post("/user", (req, res) => {
  console.log("saved the data");
  res.send("Data saved successfully");
});

app.delete("/user", (req, res) => {
  console.log("deleted successfully");
  res.send("deleted successfully");
});

app.patch("/user", (req, res) => {
  res.send({
    role: "student",
  });
});

//This is for all http methods
app.use("/test", (req, res) => {
  res.send("Test");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
