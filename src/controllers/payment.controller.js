import rzpInstance from "../utils/razorpay.js";
import Payment from "../models/payment.model.js";
import { membershipAmount } from "../utils/constants.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Creates a Razorpay order for a membership subscription.
 */
const createOrder = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { membershipType } = req.body;

  if (!membershipType || !membershipAmount[membershipType]) {
    throw new ApiError(400, "Invalid membership type");
  }

  const orderOptions = {
    amount: membershipAmount[membershipType] * 100, // Amount in paise
    currency: "INR",
    receipt: "order_rcptid_" + Date.now().toString().slice(-6),
    partial_payment: false,
    notes: {
      userId: loggedInUser._id.toString(),
      firstName: loggedInUser.firstName,
      lastName: loggedInUser.lastName,
      emailId: loggedInUser.emailId,
      membershipType,
    },
  };

  const order = await rzpInstance.orders.create(orderOptions);

  const payment = new Payment({
    userId: loggedInUser._id,
    orderId: order.id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes,
  });

  const savedPayment = await payment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
    }, "Order created successfully"));
});

/**
 * Handles Razorpay webhook events.
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.get("X-Razorpay-Signature");

  const isWebhookValid = validateWebhookSignature(
    JSON.stringify(req.body),
    webhookSignature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  if (!isWebhookValid) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const paymentDetails = req.body.payload.payment.entity;
  const payment = await Payment.findOne({ orderId: paymentDetails?.order_id });

  if (payment) {
    payment.status = paymentDetails?.status;
    payment.paymentId = paymentDetails?.id;
    await payment.save();

    if (paymentDetails?.status === "captured") {
      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
      }
    }
  }

  return res.status(200).json(new ApiResponse(200, {}, "Webhook processed successfully"));
});

/**
 * Verifies if the user is a premium member.
 */
const verifyPremium = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Premium verification successful"));
});

export { createOrder, handleWebhook, verifyPremium };
