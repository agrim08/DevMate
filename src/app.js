const express = require("express");
const connectDB = require("./config/database");

const app = express();

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
