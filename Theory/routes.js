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

//reading user info:
app.get("/testuser/:userID", (req, res) => {
  console.log(req.params);
  console.log(req.query); //printed to console
  res.send({ city: "delhi", country: "India" });
});

//we can write regex also:
app.get(/a/, (req, res) => {
  res.send("Testing regex");
});

//This is for all http methods
app.use("/test", (req, res) => {
  res.send("Test");
});

app.use("/about/2", (req, res) => {
  res.send("invalid");
});

app.use("/test", (req, res) => {
  res.send("Hello from DevMate");
});

app.use("/about", (req, res) => {
  res.send("Hello from About page");
});

//*Every call starting with / will hit this route but if we move this to last of the code then it will stop
app.use("/", (req, res) => {
  res.send("Hello from Home page");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
