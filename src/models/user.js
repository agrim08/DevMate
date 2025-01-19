const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 15,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value))
          throw new Error("Invalid email format" + value);
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value))
          throw new Error("password is not strong");
      },
    },
    DateOfBirth: {
      type: Date,
    },
    userAge: {
      type: Number,
    },
    gender: {
      type: String,
      lowercase: true,
      validate(valid) {
        if (!["male", "female", "others"].includes(valid)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    bio: {
      type: String,
      default: "This is a default bio",
      minLength: 20,
      maxLength: 150,
    },
    skills: {
      type: [String],
      default: [],
    },
    photoUrl: {
      type: String,
      default:
        "https://www.ihna.edu.au/blog/wp-content/uploads/2022/10/user-dummy.png",
      validate(value) {
        if (!validator.isURL(value)) throw new Error("Invalid Photo URL");
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (userEnteredPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    userEnteredPassword,
    passwordHash
  );
  return isPasswordValid;
};

// userSchema.virtual("age").get(function () {
//   if (!this.dateOfBirth) return null;
//   const ageDiff = Date.now() - this.dateOfBirth.getTime();
//   const ageDate = new Date(ageDiff);
//   return Math.abs(ageDate.getUTCFullYear() - 1970);
// });

module.exports = mongoose.model("User", userSchema);
