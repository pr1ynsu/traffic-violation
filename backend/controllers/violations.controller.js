// backend/controllers/violations.controller.js (CommonJS)

const Violation = require('../models/Violation');
const User = require('../models/User');

// ** 1. POST - LOG VIOLATION (ML Team Input) **
async function createViolation(req, res) {
    try {
        // Deconstruct ALL fields from the ML Team's payload
        const { 
            violationId, deviceId, timestamp, gpsLocation, 
            licensePlateText, evidenceFileName, violationType
        } = req.body; 

        // CRITICAL VALIDATION CHECK
        if (!violationId || !deviceId || !evidenceFileName) {
            return res.status(400).json({ error: "Missing required audit fields (ID, Device, or Filename)." });
        }

        // Create new Mongoose document instance
        const violation = new Violation({ 
            violationId, deviceId, timestamp, gpsLocation, 
            licensePlateText: licensePlateText || 'UNKNOWN', 
            evidenceFileName,
            violationType: violationType || "Helmet Violation"
        });
        
        await violation.save();

        res.status(201).json({ message: "Violation logged successfully", id: violation.violationId });
    } catch (error) {
        console.error("❌ Failed to log violation:", error);
        if (error.code === 11000) { // Handle unique ID conflict
            return res.status(409).json({ message: "Violation ID already exists." });
        }
        res.status(500).json({ error: "Server failed to process and save violation." });
    }
}


// ** 2. GET - USER CHALANS LOOKUP (Protected Route)**
async function getChalansByVehicle(req, res) {
    try {
        // Get user's vehicle ID from the JWT payload (placed there by auth middleware)
        const vehicleNumber = req.user.vehicle; 
        
        // Find all violations linked to this user's vehicle number
        const chalans = await Violation.find({ 
            licensePlateText: vehicleNumber
        }).sort({ 
            timestamp: -1 
        });

        // The frontend expects the array of violation records
        res.status(200).json(chalans);

    } catch (error) {
        console.error("❌ Failed to fetch chalans:", error);
        res.status(500).json({ error: "Server failed to retrieve violation data." });
    }
}

module.exports = { createViolation, getChalansByVehicle };