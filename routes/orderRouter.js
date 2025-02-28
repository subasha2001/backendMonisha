const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const { sendPaymentConfirmationEmailForAdmin, sendPaymentConfirmationEmailForUser } = require("./mailerRouter");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { amount, billingDetails, cartItems, paymentMethodId } = req.body;

    if (!amount || amount <= 0 || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }
    
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never" 
      }
    });

    const newOrder = new Order({
      userInfo: billingDetails,
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        images: item.images,
        price: item.price,
        quantity: item.quantity
      })),
      payment: {
        transactionId: paymentIntent.id,
        amount: amount,
        currency: "usd",
        status: paymentIntent.status
      },
      totalAmount: amount,
      totalQuantity: cartItems.reduce((total, item) => total + item.quantity, 0)
    });

    await newOrder.save();
    await sendPaymentConfirmationEmailForUser(billingDetails.email, newOrder);
    await sendPaymentConfirmationEmailForAdmin(billingDetails, newOrder);

    res.json({
      success: true,
      message: "Order Placed & Payment Successful",
      orderId: newOrder._id
    });
  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});

// router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//   console.log("🔍 Incoming Webhook Event:", req.body);

//   const sig = req.headers["stripe-signature"];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
//   }

//   console.log(`✅ Stripe Event Received: ${event.type}`);

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     console.log("✅ Payment successful:", paymentIntent);

//     try {
//       // Start transaction to update order safely
//       const session = await Order.startSession();
//       session.startTransaction();

//       const order = await Order.findOneAndUpdate(
//         { "payment.transactionId": paymentIntent.id },
//         { $set: { "payment.status": "Paid" } },
//         { new: true, session }
//       );

//       if (!order) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error("❌ Order not found for Payment Intent ID:", paymentIntent.id);
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       console.log("✅ Order payment updated successfully:", order);
//       return res.json({ success: true, message: "Payment verified, order updated" });
//     } catch (err) {
//       console.error("❌ Error updating order payment:", err);
//       return res.status(500).json({ success: false, message: "Payment update failed" });
//     }
//   } else {
//     console.warn(`⚠️ Unhandled Stripe event: ${event.type}`);
//   }

//   res.sendStatus(200);
// });

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Fetch orders sorted by latest
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});

module.exports = router;