const { Router } = require("express");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { UserModel } = require("../models/userModel");
const nodemailer = require("nodemailer");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth.mid");

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      const users = await UserModel.findOne({ email, isAdmin: false });
      if (!users) return res.status(404).json({ message: 'Customer not found' });

      if (!users.isActive) return res.status(403).json({ message: 'Account not activated. Please contact admin.' });

      const isPasswordValid = await bcrypt.compare(password, users.password);
      if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: users._id, isAdmin: users.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const user = { ...users.toObject(), token };

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in customer' });
    }
  })
);

router.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await UserModel.findOne({ email, isAdmin: true, password });
      if (!admin) return res.status(404).json({ message: 'Invalid Credentials' });

      const token = jwt.sign({ id: admin._id, isAdmin: admin.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      const admiN = { ...admin.toObject(), token };

      res.status(200).json({ token, admiN, message: "Admin Logged In Successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in admin' });
    }
  })
);

router.get('/', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

const sendRegistrationEmail = (user) => {
  const recipients = [
    { email: 'subashayyanar1@gmail.com', template: adminTemplate(user) },
    { email: user.email, template: userTemplate(user) },
  ];

  recipients.forEach((recipient) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient.email,
      subject: recipient.email === 'subashayyanar1@gmail.com'
        ? 'New User Registration Notification'
        : 'Welcome to Monisha Trades',
      html: recipient.template,
      attachments: [
        {
          filename: 'goldPalaceLogo2.png',
          path: './uploads/goldPalaceLogo2.png',
          cid: 'goldPalaceLogo',
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Error sending email to ${recipient.email}:`, error);
      } else {
        console.log(`Email sent to ${recipient.email}: ${info.response}`);
      }
    });
  });
};

const adminTemplate = (user) => `
  <div style="text-align: center;">
    <img src="cid:goldPalaceLogo" alt="Monisha Trades logo" style="width: 150px; margin-bottom: 20px;" />
  </div>
  <p>A new user has registered.</p>
  <p><strong>Name:</strong> ${user.name}</p>
  <p><strong>Company Name:</strong> ${user.cname}</p>
  <p><strong>Email:</strong> ${user.email}</p>
  <p><strong>Phone:</strong> ${user.number}</p>
  <p><strong>Address:</strong> ${user.address}</p>
  <p><strong>Pincode:</strong> ${user.pincode}</p>
  <p>Please activate this user to allow login.</p>
`;

const userTemplate = (user) => `
  <div style="text-align: center;">
    <img src="cid:goldPalaceLogo" alt="Gold Palace Jewellery Logo" style="width: 150px; margin-bottom: 20px;" />
  </div>
  <p>Welcome to Monisha Trades, ${user.name}!</p>
  <p>Thank you for registering with us.</p>
  <p>We are delighted to have you as part of our community.</p>
  <p>If you have any questions, feel free to contact us anytime.</p>
  <p>+91 9025567759</p>
  <p>subashayyanar1@gmail.com</p>
`

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, number, email, password, address, pincode, cname } = req.body;

    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already exists, Please Login' });

      const user = new UserModel({
        email,
        name,
        cname,
        number,
        address,
        pincode,
        password,
        isActive: false,
      });

      await user.save();
      sendRegistrationEmail(user);
      res.status(201).json({ 
        message: 'Customer registered successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Error registering customer' });
    }
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isAdmin) {
        return res.status(403).json({ message: "Cannot modify admin accounts" });
      }

      user.isActive = isActive;
      await user.save();

      res.status(200).json({ message: "User account status updated", user });
    } catch (error) {
      console.error("Error updating user account status:", error);
      res.status(500).json({ message: "Error updating account status" });
    }
  })
);
module.exports = router;