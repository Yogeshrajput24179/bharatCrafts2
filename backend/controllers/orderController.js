import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config(); 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

export const placeOrder = async (req, res) => {
    const frontend_url = req.headers.origin || "http://localhost:5173";

    try {
        console.log("🔹 Incoming Order Request:", JSON.stringify(req.body, null, 2));

        const { userId, items, deliveryAddress, totalAmount } = req.body;

        if (!userId || !items || items.length === 0 || !deliveryAddress || !totalAmount) {
            console.error("❌ Missing required fields:", { userId, items, deliveryAddress, totalAmount });
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newOrder = new Order({
            userId,
            items,
            deliveryAddress,
            totalAmount,
            status: "Pending",
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Convert cart items for Stripe
        const line_items = items.map((item) => ({
            price_data: {
                currency: "inr",
                unit_amount: Math.round(item.price * 100), // Convert price to paise
                product_data: {
                    name: item.name || "Unnamed Product",
                    description: item.description || "No description available",
                },
            },
            quantity: item.quantity,
        }));
        
        // ✅ Add Shipping Fee
        line_items.push({
            price_data: {
                currency: "inr",
                unit_amount: 20000, // ₹200 in paise (200 * 100)
                product_data: {
                    name: "Shipping Fee",
                    description: "Standard shipping fee",
                },
            },
            quantity: 1,
        });
        
        console.log("🛒 Stripe Line Items:", JSON.stringify(line_items, null, 2));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder.id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder.id}`
        });

        console.log("🔍 Full Stripe Response:", JSON.stringify(session, null, 2));

        if (!session || !session.url) {
            console.error("❌ Stripe session creation failed.");
            return res.status(500).json({ success: false, message: "Failed to create Stripe session." });
        }

        res.json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder,
            session_url: session.url  // ✅ Send session URL properly
        });

    } catch (error) {
        console.error("❌ Stripe Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
