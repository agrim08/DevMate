const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const rzpInstance = require("../utils/razorpay");
const Payment = require("../models/payment.model");
const membershipAmount = require("../utils/constants");

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

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).send("ERROR :" + error.message);
  }
});

module.exports = paymentRouter;
