const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    DateOfBirth: {
      type: Date,
      default: Date.now(),
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      validate(valid) {
        if (!["male", "female", "others"].includes(valid)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    Bio: {
      type: String,
      default: "This is a default bio",
    },
    skills: {
      type: [String],
    },
    photoUrl: {
      type: String,
      default:
        "https://www.ihna.edu.au/blog/wp-content/uploads/2022/10/user-dummy.png",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
