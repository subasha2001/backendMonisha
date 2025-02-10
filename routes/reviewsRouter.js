const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { ReviewModel } = require("../models/bannerModel");

const router = Router();

router.post(
  "/post",
  asyncHandler(async (req, res) => {
    const { productName, imageDis, name, number, review } = req.body;

    const newReview = {
      productName,
      imageDis,
      name,
      number,
      review,
    };

    const dbReview = await ReviewModel.create(newReview);
    res.send(dbReview);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const reviews = await ReviewModel.find();
    res.send(reviews);
  })
);

router.delete(
  "/delete/:id",
  asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const deletedReview = await ReviewModel.findByIdAndDelete(id);
  
      if (!deletedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      res.status(200).json({ message: 'Review deleted successfully', user: deletedReview });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete review', error });
    }
  })
);

module.exports = router;