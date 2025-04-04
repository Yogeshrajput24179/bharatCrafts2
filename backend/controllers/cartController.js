import CartModel from "../models/cartModel.js"; // ✅ Importing Cart Model
import userModel from "../models/userModel.js"; // ✅ Importing User Model
import jwt from "jsonwebtoken";  
import Cart from "../models/cartModel.js";

// ✅ Add to Cart
const addToCart = async (req, res) => {
  try {
    console.log("🔹 Adding item to cart for user:", req.body.userId);

    if (!req.body.userId) {
      console.error("❌ User ID missing in request.");
      return res.status(401).json({ success: false, message: "User ID missing, unauthorized." });
    }

    const { productId } = req.body; // Product ID

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    let cart = await CartModel.findOne({ userId: req.body.userId });

    if (!cart) {
      console.log("⚠️ Cart not found, creating new cart.");
      cart = new CartModel({ userId: req.body.userId, items: [] });
    }

    // ✅ Check if item already exists in cart
    let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("❌ Error adding to cart:", error.message);
    res.status(500).json({ success: false, message: "Error adding to cart." });
  }
};

// ✅ Remove from Cart
const removeFromCart = async (req, res) => {
  try {
      const userId = req.user.id;
      const { productId } = req.params; // ✅ Extract productId from params

      let cart = await Cart.findOne({ userId });

      if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found" });
      }

      // ✅ Remove the specific item from the cart
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      
      await cart.save();

      res.json({ success: true, message: "Item removed from cart", cart });
  } catch (error) {
      console.error("❌ Error removing item:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};
// ✅ Get Cart
const getCart = async (req, res) => {
  try {
      const userId = req.user.id;
      let cart = await Cart.findOne({ userId }).populate({
          path: "items.productId",
          model: "Product", // ✅ Ensure MongoDB references the Product model
          select: "id name price image", // ✅ Fetch `id`, not `_id`
      });

      if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found" });
      }

      // ✅ Ensure every item has a valid `productId`
      cart.items = cart.items.filter(item => item.productId && item.productId.id);

      res.json({ success: true, cart });
  } catch (error) {
      console.error("❌ Error fetching cart:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};



export { addToCart, removeFromCart, getCart };
