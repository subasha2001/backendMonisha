const asyncHandler = require("express-async-handler");
const { Router } = require("express");
const router = Router();
const nodemailer = require("nodemailer");

router.post(
  "/send-email",
  asyncHandler(async (req, res) => {
    const { name, email, number, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nMessage: ${message}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json("Email sent successfully");
    } catch (error) {
      res.status(500).json("Failed to send email");
    }
  })
);

router.post(
  "/get-quote",
  asyncHandler(async (req, res) => {
    const { name, email, number, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nMessage: ${message}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json("Email sent successfully");
    } catch (error) {
      res.status(500).json("Failed to send email");
    }
  })
);

module.exports = router;