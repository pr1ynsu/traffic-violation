// backend/models/User.js (CommonJS)

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    // Must match the passwordHash field used in your auth.js logic
    passwordHash: { type: String, required: true },
    vehicle: { type: String, required: true, unique: true, index: true }, // Crucial for Chalan lookup
    role: { type: String, enum: ['user', 'government'], default: 'user' },
    org: { type: String }, // For government users
    department: { type: String }, // For government users
    mobile: { type: String },
    license: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);