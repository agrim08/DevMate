import nodemailer from "nodemailer";
import config from "../config/index.js";

/**
 * Sends an OTP verification email using Nodemailer and centralized config.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The 6-digit OTP.
 */
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"DevMate" <${config.smtp.user}>`,
    to: email,
    subject: "Verify your email - DevMate",
    html: `
      <div style="font-family: sans-serif; text-align: center; color: #333;">
        <h2 style="color: #6366f1;">Email Verification</h2>
        <p>Welcome to DevMate! Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">&copy; 2024 DevMate. All rights reserved.</p>
      </div>
    `,
  });
};

export default sendOTPEmail;
