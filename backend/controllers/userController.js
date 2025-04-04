import UserModel from "../models/userModel.js"; // ✅ Ensure correct import
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

console.log("✅ UserModel Loaded:", UserModel); // ✅ Debugging to check import

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists!" });
        }

        const newUser = new UserModel({ name, email, password });
        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully!", user: newUser });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials!" });
        }

        // ✅ Generate JWT Token with SECRET KEY
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        console.log("✅ Generated Token:", token);
        res.json({ success: true, message: "Login successful!", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
