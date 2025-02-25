const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { amount, billingDetails, cartItems } = req.body;

    if (!amount || amount <= 0 || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // ✅ Step 1: Create Order with `null` transactionId
    const newOrder = new Order({
      userInfo: billingDetails,
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      payment: {
        transactionId: null, // ✅ Initially null
        amount: amount,
        currency: "usd",
        status: "Pending"
      },
      totalAmount: amount
    });

    await newOrder.save();

    // ✅ Step 2: Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        orderId: newOrder._id.toString(),
        userEmail: billingDetails.email
      }
    });

    // ✅ Step 3: Update Order with Stripe Transaction ID
    newOrder.payment.transactionId = paymentIntent.id;
    await newOrder.save();

    res.json({
      success: true,
      message: "Order created successfully!",
      orderId: newOrder._id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("🔍 Incoming Webhook Event:", req.body);
  
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  console.log(`✅ Stripe Event Received: ${event.type}`);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("✅ Payment successful:", paymentIntent);

    try {
      // Start transaction to update order safely
      const session = await Order.startSession();
      session.startTransaction();

      const order = await Order.findOneAndUpdate(
        { "payment.transactionId": paymentIntent.id },
        { $set: { "payment.status": "Paid" } },
        { new: true, session }
      );

      if (!order) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Order not found for Payment Intent ID:", paymentIntent.id);
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      await session.commitTransaction();
      session.endSession();

      console.log("✅ Order payment updated successfully:", order);
      return res.json({ success: true, message: "Payment verified, order updated" });
    } catch (err) {
      console.error("❌ Error updating order payment:", err);
      return res.status(500).json({ success: false, message: "Payment update failed" });
    }
  } else {
    console.warn(`⚠️ Unhandled Stripe event: ${event.type}`);
  }

  res.sendStatus(200);
});

module.exports = router;