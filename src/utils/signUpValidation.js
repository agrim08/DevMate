import validator from "validator";
import { ApiError } from "./ApiError.js";

/**
 * Validates the sign-up request body.
 * Throws an ApiError if validation fails.
 * 
 * @param {Object} req - The Express request object.
 */
const signUpValidation = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  const errors = [];

  if (!firstName || !lastName) {
    errors.push("First name and last name are required");
  }
  if (!validator.isEmail(emailId)) {
    errors.push("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    errors.push("Password must be strong (min 8 chars, including uppercase, lowercase, numbers, and symbols)");
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }
};

export { signUpValidation };
