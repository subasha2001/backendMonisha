const express = require("express");
const Coupon = require("../models/couponModel");

const router = express.Router();

router.post(
  "/", (async (req, res) => {
    console.log(req.body); // Debugging

    const { code } = req.body; // Extract code properly

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Coupon code is required and must be a string" });
    }

    try {
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      const coupon = new Coupon({ code });
      await coupon.save();
      res.status(201).json({ message: "Coupon created successfully", coupon });
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Error creating coupon", error });
    }
  })
);

router.get("/", (async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons", error });
  }
})
);

router.get("/:id", (async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupon", error });
  }
})
);

router.put("/:id", (async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.code = code || coupon.code;
    await coupon.save();
    res.json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error updating coupon", error });
  }
})
);

router.delete("/:id", (async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.deleteOne();
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coupon", error });
  }
})
);

module.exports = router;