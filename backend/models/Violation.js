// backend/models/Violation.js (FINAL ML Contract Schema)

const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
    // 1. UNIQUE IDENTIFIER (from ML Team) - Critical for idempotency
    violationId: {
        type: String, 
        required: true,
        unique: true 
    },
    // 2. DEVICE/CAMERA AUDIT (from ML Team)
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    // 3. VEHICLE DATA (Matches licensePlateText from controller logic)
    licensePlateText: {
        type: String,
        required: false, // Can be null if OCR fails
        index: true
    },
    // 4. TIMESTAMP (from ML Team)
    timestamp: {
        type: Date,
        default: Date.now
    },
    // 5. GEOSPATIAL DATA (from ML Team)
    gpsLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    // 6. IMAGE EVIDENCE (from ML Team) - The link to the saved proof file
    evidenceFileName: {
        type: String,
        required: true,
    },
    // Project Specific Field
    violationType: {
        type: String,
        default: "Helmet Violation"
    }
}, { timestamps: true });

module.exports = mongoose.model('Violation', ViolationSchema);
