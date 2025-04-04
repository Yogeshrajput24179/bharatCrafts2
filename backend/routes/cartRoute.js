import express from "express";
import { removeFromCart } from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";
import Cart from "../models/cartModel.js";

const router = express.Router();

// ✅ Fix: Allow multiple different products in cart
router.post("/add", authMiddleware, async (req, res) => {
    try {
        console.log("🔹 Received request at /api/cart/add");
        const userId = req.user.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID missing" });
        }

        let cart = await Cart.findOne({ userId });
        console.log("🔹 Current Cart:", cart);  // ✅ Log existing cart

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // ✅ Find if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex !== -1) {
            // ✅ If product exists, increase quantity
            cart.items[existingItemIndex].quantity += 1;
        } else {
            // ✅ If new product, add to cart
            cart.items.push({ productId, quantity: 1 });
        }

        await cart.save();
        console.log("✅ Updated Cart After Adding:", cart); // ✅ Log updated cart

        // ✅ Return the updated cart
        const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
        res.json({ success: true, message: "Item added to cart", cart: updatedCart });
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.post("/remove", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // ✅ Find product in cart
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1; // ✅ Decrease quantity
            } else {
                cart.items.splice(itemIndex, 1); // ✅ Remove if quantity is 1
            }
            await cart.save();
            return res.json({ success: true, message: "Item updated in cart", cart });
        } else {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }
    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
