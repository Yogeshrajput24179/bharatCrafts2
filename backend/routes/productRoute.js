import express from "express";
import multer from "multer";
import { addProduct, listProduct, removeProduct } from "../controllers/productController.js";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ Fix: Add product route with image upload middleware
router.post("/add", upload.single("image"), addProduct);
router.get("/list", listProduct);
router.delete("/remove/:id", removeProduct);

export default router;
