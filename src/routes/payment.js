const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const rzpInstance = require("../utils/razorpay");
const Payment = require("../models/payment.model");
const membershipAmount = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

paymentRouter.post("/payment/create-order", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { membershipType } = req.body;

    const order = await rzpInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, //50000 refers to 50000 paise
      currency: "INR",
      receipt: "order_rcptid_11",
      partial_payment: false,
      notes: {
        firstName: loggedInUser?.firstName,
        lastName: loggedInUser?.lastName,
        emailId: loggedInUser?.emailId,
        membershipType: "emerald",
      },
    });

    console.log(order);

    //saving to db and returning to fe
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

    res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
    });
  } catch (error) {
    res.status(500).send("ERROR :" + error.message);
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      res.status(404).json({ message: "Invalid webhook signature" });
    }

    //update payment in DB
    const paymentDetails = req.body.payload.entity;
    const payment = await Payment.findOne({
      orderId: paymentDetails?.order_id,
    });
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    //mark user as premium

    if (req.body.event == "payment.captured") {
    }

    if (req.body.event == "payment.filed") {
    }

    //return res.status(200)
    return res.status(200).send("Webhook processed successfully"); //!always returns 200, otherwise rzp goes into infinite loop
  } catch (error) {
    console.error(error.message);
    res.status(500).send("ERROR :" + error.message);
  }
});

module.exports = paymentRouter;
