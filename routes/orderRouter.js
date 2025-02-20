const { Router } = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = Router();

router.post('/create', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// router.post('/webhook', express.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     console.log("✅ Payment successful:", paymentIntent);

//     // Extract payment details
//     const { id, amount_received, currency } = paymentIntent;
//     const orderData = req.body.metadata; // Metadata from frontend

//     // ✅ Create and Save Order in Database
//     const newOrder = new Order({
//       userInfo: JSON.parse(orderData.userInfo),
//       orderItems: JSON.parse(orderData.orderItems),
//       payment: {
//         transactionId: id,
//         amount: amount_received / 100,
//         currency,
//         status: "Paid",
//       },
//       totalAmount: amount_received / 100,
//     });

//     await newOrder.save();

//     console.log("✅ Order saved in database:", newOrder);
//   } else {
//     console.warn(`⚠️ Unhandled event type: ${event.type}`);
//   }

//   res.json({ success: true });
// });

module.exports = router;