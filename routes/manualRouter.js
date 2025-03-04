const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Pdf = require("../models/manualModel");

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: "./uploads/manuals",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 📌 Upload PDF
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const { category, productFamily } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newPdf = new Pdf({
      name: req.file.originalname,
      path: `/uploads/manuals/${req.file.filename}`,
      category,
      productFamily
    });

    await newPdf.save();
    res.json({ message: "PDF Uploaded Successfully", pdf: newPdf });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 📌 Get All PDFs
router.get("/", async (req, res) => {
  try {
    const pdfs = await Pdf.find();
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch PDFs" });
  }
});

// 📌 Serve PDF for Viewing
router.get("/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads/manuals", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
});

// 📌 Update PDF (Only Category & Product Family)
router.put("/:id", async (req, res) => {
  try {
    const { category, productFamily } = req.body;
    const updatedPdf = await Pdf.findByIdAndUpdate(
      req.params.id,
      { category, productFamily },
      { new: true }
    );

    if (!updatedPdf) return res.status(404).json({ error: "PDF not found" });

    res.json({ message: "PDF Updated Successfully", pdf: updatedPdf });
  } catch (error) {
    res.status(500).json({ error: "Update Failed" });
  }
});

// 📌 Delete PDF (Removes from DB & Server)
router.delete("/:id", async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    // Remove file from server
    const filePath = path.join(__dirname, "../", pdf.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Remove from database
    await Pdf.findByIdAndDelete(req.params.id);
    res.json({ message: "PDF Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete Failed" });
  }
});

router.get("/search/:searchTerm", async (req, res) => {
  try {
    const query = req.params.searchTerm;
    if (!query) return res.status(400).json({ error: "Search query is required" });

    const pdfs = await Pdf.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { productFamily: { $regex: query, $options: "i" } }
      ]
    });

    if (pdfs.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: "Search Failed" });
  }
});

module.exports = router;