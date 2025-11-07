// backend/models/Violation.js - Updated to match CSV schema from mock ML script

const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
    // Unique identifier (matches CSV 'id')
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Timestamp of violation (matches CSV 'timestamp')
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: -1 // Descending index for timestamp queries
    },
    // Vehicle number plate (matches CSV 'vehicle_number')
    vehicle_number: {
        type: String,
        required: true,
        index: true
    },
    // Violation code (numeric, matches CSV 'violation_code')
    violation_code: {
        type: Number,
        required: true,
        index: true
    },
    // Violation description (matches CSV 'violation_text')
    violation_text: {
        type: String,
        required: true
    },
    // Offender name (single letter, matches CSV 'offender_name')
    offender_name: {
        type: String,
        required: true
    },
    // Challan amount in rupees (matches CSV 'challan_rupees')
    challan_rupees: {
        type: Number,
        required: true
    },
    // Credits amount in rupees (matches CSV 'credits_rupees')
    credits_rupees: {
        type: Number,
        required: true
    },
    // Path to photo file (matches CSV 'photo_path', stored in backend storage)
    photo_path: {
        type: String,
        required: true
    },
    // Dashboard fields
    verified: {
        type: Boolean,
        default: false,
        index: true
    },
    verified_at: {
        type: Date
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String
    }
}, { timestamps: true });

// Compound index for verified + timestamp queries (dashboard performance)
ViolationSchema.index({ verified: 1, timestamp: -1 });

module.exports = mongoose.model('Violation', ViolationSchema);
