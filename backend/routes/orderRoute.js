import express from "express";
import Order from "../models/orderModel.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ POST request to place an order
router.post("/place", authMiddleware, async (req, res) => {
    console.log("📩 Incoming Order API Hit");

    try {
        console.log("🔹 Received Request Body:", req.body);

        const { userId, items, deliveryAddress, totalAmount } = req.body;

        // 🛑 Fix: Ensure `userId` exists (was `user` instead of `userId`)
        if (!userId || !items || items.length === 0) {
            console.error("❌ Validation Error: Missing order details");
            return res.status(400).json({ success: false, message: "Order must contain at least one valid item and a valid user ID." });
        }

        console.log("✅ Order Data Validated:", { userId, items, totalAmount });

        // ✅ Fix: Use `userId` correctly (was using `user` instead of `userId`)
        const newOrder = new Order({
            userId, // 🛠️ Ensure field name matches `orderModel.js`
            items,
            deliveryAddress,
            totalAmount,
            status: "Pending", // 🛠️ Default order status
        });

        await newOrder.save();
        console.log("🎉 Order Saved Successfully!", newOrder);

        res.status(201).json({ success: true, message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        console.error("❌ Order Placement Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
