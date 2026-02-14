/**
 * Generates a random 6-digit OTP string.
 * @returns {string} - The generated OTP.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default generateOTP;