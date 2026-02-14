import rzpInstance from "../utils/razorpay.js";
import Payment from "../models/payment.model.js";
import { membershipAmount } from "../utils/constants.js";
import { validateWebhookSignature, validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
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
    notes: {
      membershipType: membershipType,
      firstName: loggedInUser.firstName,
      lastName: loggedInUser.lastName,
    },
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
        // Access nested notes property correctly from payment model which stores it
        user.membershipType = payment.notes.membershipType;
        await user.save();
      }
    }
  }

  return res.status(200).json(new ApiResponse(200, {}, "Webhook processed successfully"));
});

/**
 * Verifies payment signature and updates user status immediately.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const secret = process.env.RAZORPAY_KEY_SECRET;
  
  // Verify using Razorpay util
  const isValid = validatePaymentVerification(
    { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    secret
  );

  if (!isValid) {
    throw new ApiError(400, "Payment verification failed");
  }

  // Update Payment Record
  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
      throw new ApiError(404, "Order not found");
  }
  
  payment.paymentId = razorpay_payment_id;
  payment.status = "captured"; // Assuming successful frontend verification implies captured/authorized
  await payment.save();

  // Update User Record Immediately
  const user = await User.findById(req.user._id);
  user.isPremium = true;
  user.membershipType = payment.notes.membershipType;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Payment verified and user upgraded successfully"));
});

export { createOrder, handleWebhook, verifyPayment };
