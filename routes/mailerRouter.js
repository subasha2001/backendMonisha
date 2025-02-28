const nodemailer = require("nodemailer");

const sendPaymentConfirmationEmailForUser = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const attachments = [
    {
      filename: "logo.png",
      path: "./uploads/logo.png",
      cid: "logoImage"
    },
    ...orderDetails.orderItems.map((product, index) => ({
      filename: `${product.name}.jpg`,
      path: `.${product.images}`,
      cid: `productImage${index}`
    }))
  ];

  const emailHtml = 
  `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    <div style="text-align: center;">
      <img src="cid:logoImage" alt="Monisha Trades Logo" style="max-width: 150px; margin-bottom: 20px;">
    </div>
    <p>Dear <strong>${orderDetails.userInfo.name}</strong>,</p>
    <p>We are pleased to inform you that your payment for <strong>Order #${orderDetails.id}</strong> has been successfully confirmed.</p>
    
    <h3>Order Details:</h3>
    <p><strong>Order ID:</strong> ${orderDetails.id}</p>
    <p><strong>Items:</strong></p>
    
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Image</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${orderDetails.orderItems.map((item, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              <img src="cid:productImage${index}" alt="${item.name}" style="max-width: 50px; height: auto;">
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <p><strong>Total Quantity:</strong> ${orderDetails.totalQuantity}</p>
    <p><strong>Total Price:</strong> $${orderDetails.totalAmount}</p>

    <p>Thank you for shopping with us.</p>

    <p>Best Regards,<br><strong>Monisha Trades Team</strong></p>
  </div>
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Monisha Trades Order Confirmation - Order # " + orderDetails.id,
    html:emailHtml,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendPaymentConfirmationEmailForAdmin = async (user, orderDetails) => {
  console.log(user);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const attachments = [
    {
      filename: "logo.png",
      path: "./uploads/logo.png",
      cid: "logoImage"
    },
    ...orderDetails.orderItems.map((product, index) => ({
      filename: `${product.name}.jpg`,
      path: `.${product.images}`,
      cid: `productImage${index}`
    }))
  ];

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Order Placed</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 0px 10px 0px #ccc;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        h2 {
          color: #333;
          text-align: center;
        }
        .order-details {
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #ddd;
          background: #fafafa;
          border-radius: 8px;
        }
        .order-items {
          margin-top: 10px;
        }
        .order-items table {
          width: 100%;
          border-collapse: collapse;
        }
        .order-items th, .order-items td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .product-img {
          max-width: 70px;
          border-radius: 5px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logoImage" alt="Company Logo">
          <h2>New Order Notification</h2>
        </div>

        <p><strong>${user.name}</strong> has placed a new order.</p>
        <p>Payment for Order <strong>#${orderDetails.id}</strong> has been successfully confirmed and verified.</p>

        <div class="order-details">
          <p><strong>Order ID:</strong> ${orderDetails.id}</p>
          <p><strong>Total Price:</strong> $${orderDetails.totalAmount}</p>
          <p><strong>Total Quantity:</strong> ${orderDetails.totalQuantity}</p>
          <p><strong>Shipping Address:</strong> ${user.address}, ${user.state}, ${user.country}, ${user.zipcode}</p>
        </div>

        <h3>Ordered Items:</h3>
        <div class="order-items">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Product ID</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.orderItems
                .map(
                  (item, index) => `
                    <tr>
                      <td>${item.name}</td>
                      <td><img src="cid:productImage${index}" alt="${item.name}" class="product-img"></td>
                      <td>${item.quantity}</td>
                      <td>${item._id}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <p>Admin, please review the order.</p>

        <div class="footer">
          <p><strong>Monisha Trades Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Monisha Trades Order Confirmation - Order # " + orderDetails.id,
    html:emailHtml,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendLoginNotification = async (customerEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'subashinr.is@gmail.com',
      subject: "Customer Login Alert",
      text: `Customer with email ${customerEmail} has just logged in.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Admin notified about customer login.");
  } catch (error) {
    console.error("Error sending email to admin:", error);
  }
}
module.exports = { sendPaymentConfirmationEmailForAdmin, sendPaymentConfirmationEmailForUser, sendLoginNotification }