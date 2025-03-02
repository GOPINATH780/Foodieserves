const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jackgopi612@gmail.com',
        pass: 'gkpa ajzq zdml yyfz' 
    }
});

// Generate and send OTP
router.post('/api/orders/:orderId/generate-otp', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP to order
        order.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        };
        await order.save();

        // Send OTP via email
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: order.userEmail,
            subject: 'Food Delivery OTP Verification',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <h2 style="color: #333;">Food Delivery OTP</h2>
                    <p>Your OTP for food delivery verification is:</p>
                    <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to generate OTP' });
    }
});

// Verify OTP and mark order as delivered
router.post('/api/orders/:orderId/verify-otp', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const { otp } = req.body;

        // Check if OTP matches and hasn't expired
        if (!order.otp || !order.otp.code || order.otp.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
        }

        if (order.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Mark order as delivered
        order.deliveryStatus = 'delivered';
        order.otp = undefined; // Clear OTP after successful verification
        await order.save();

        res.json({ success: true, message: 'Order marked as delivered successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});

module.exports = router; 