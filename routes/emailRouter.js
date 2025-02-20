const asyncHandler = require("express-async-handler");
const { Router } = require("express");
const router = Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post(
  "/send-email",
  asyncHandler(async (req, res) => {
    const { name, number, email, companyName, quote } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: 'New Quote Request',
      html: `
          <h2>New Quote Request from ${name}</h2> \n
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${number}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company Name:</strong> ${companyName}</p>
          <p><strong>Quote Details:</strong> ${quote}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.json({ message: 'Quote request sent successfully' });
      }
    });
  })
);

router.post(
  "/contact",
  asyncHandler(async (req, res) => {
    const { name, email, number, companyName, message } = req.body;

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: `
      
      ${name} wants to send you a message\n\n

      Name: ${name}\n
      Company Name: ${companyName}\n
      Email: ${email}\n
      Number: ${number}\n
      Message: ${message}`,
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