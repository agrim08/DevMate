const express = require("express");
require("./config/database");

const app = express();

app.listen(4000, () => {
  console.log("listening on port 4000");
});
