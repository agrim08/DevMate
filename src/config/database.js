const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://agrimgupta8105:agrimgupta8105@agrim.yxnkx.mongodb.net/namasteNode"
  );
};

connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Connection failed");
  });
