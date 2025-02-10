const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { HTTP_BAD_REQUEST } = require("../constants/http_status");
const { OrderModel } = require("../models/orderModel");
const { OrderStatus } = require("../constants/order_status");
const auth = require("../middlewares/auth.mid");
const Razorpay = require("razorpay");
const { ProductsModel } = require("../models/productsModel");
const { UserModel } = require("../models/userModel");
const { sendPaymentConfirmationEmailForUser, sendPaymentConfirmationEmailForAdmin } = require("./mailerRouter");
const crypto = require("crypto");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth.mid");

const router = Router();

const paypal = require('paypal-rest-sdk');
paypal.configure({
  mode: 'sandbox',
  client_id: 'AWWvY6QE1nkP_qJH9amBUv6OA6_SIyV4pnq2D7QNTxU7oTCvijXz0mTrhH_1OgsVr9iT8mPziyVPwpqO',
  client_secret: 'EKSNCY4-rLuGpgGLkX1keOjMWTbYyPVDV_qllVTCSvfQpXZ97O_z1Hy3YKiH0zjXv1uJXF1SiXwM7HDs',
});

const razorpay = new Razorpay({
  key_id: process.env.RPAY_KEY,
  key_secret: process.env.RPAY_SECRET,
});

router.post('/create', (req, res) => {
  const { total, currency, description } = req.body;

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:4200/success', // Angular success page
      cancel_url: 'http://localhost:4200/cancel', // Angular cancel page
    },
    transactions: [
      {
        amount: {
          currency: currency,
          total: total,
        },
        description: description,
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Payment creation failed.' });
    } else {
      const approvalUrl = payment.links.find((link) => link.rel === 'approval_url');
      res.status(200).json({ approvalUrl: approvalUrl.href });
    }
  });
});

router.post('/execute-payment', (req, res) => {
  const { paymentId, payerId } = req.body;

  const execute_payment_json = {
    payer_id: payerId,
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.error(error.response);
      res.status(500).json({ error: 'Payment execution failed.' });
    } else {
      res.status(200).json({ success: true, payment });
    }
  });
});

module.exports = router;
