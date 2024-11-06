const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://agrimgupta8105:agrimgupta8105@agrim.yxnkx.mongodb.net/namasteNode"
  );
};

module.exports = connectDB;
