const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: true
    },
    guestEmail: {
        type: String,
        required: true
    },
    guestPhone: {
        type: String,
        required: false
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Ignored'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Query', querySchema);
