const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    shippingAddress: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered'],
        default: 'pending'
    },
    otp: {
        code: String,
        expiresAt: Date
    }
});

module.exports = mongoose.model('Order', orderSchema); 