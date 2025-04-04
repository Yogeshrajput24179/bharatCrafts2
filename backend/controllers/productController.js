import productModel from "../models/productModel.js";
import fs from "fs";
import path from "path";

// Add Product
const addProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const image_filename = req.file.filename;

    const product = new productModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price), // ✅ Ensure price is stored as a number
      category: req.body.category,
      image: image_filename
    });

    await product.save();
    res.json({ success: true, message: "✅ Product Added Successfully!" });

  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ success: false, message: "Error adding product" });
  }
};

// List Products
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({}).lean();
    
    console.log("📢 Fetched products:", products); // ✅ Debugging line

    if (!products || products.length === 0) {
      console.warn("⚠ No products found in DB");
      return res.status(404).json({ success: false, message: "No products found" });
    }

    res.json({ success: true, data: products });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};


// Remove Product
 const removeProduct = async (req, res) => {
  try {
      const { id } = req.params; // ✅ Extract ID from params
      console.log("🔹 Deleting product with ID:", id);

      if (!id) {
          return res.status(400).json({ success: false, message: "Product ID is required" });
      }

      const product = await ProductModel.findByIdAndDelete(id);
      if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: "✅ Product removed successfully" });
  } catch (error) {
      console.error("❌ Error removing product:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export { addProduct, listProduct, removeProduct };
