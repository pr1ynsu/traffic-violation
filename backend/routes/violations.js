/// backend/routes/violations.js
const express = require('express');
const Violation = require('../models/Violation');
const { authMiddleware } = require('../middleware/auth'); // ✅ Corrected import

const router = express.Router();

/* ============================================================
   1️⃣ POST /api/violations 
   Used by ML system to log a new violation
============================================================ */
router.post('/', async (req, res) => {
  try {
    const { violationId, deviceId, timestamp, gpsLocation, licensePlateText, evidenceFileName } = req.body;

    // Basic validation
    if (!violationId || !deviceId || !evidenceFileName) {
      return res.status(400).json({ error: "Missing required fields: violationId, deviceId, or evidenceFileName." });
    }

    // Create a new violation record
    const violation = new Violation({
      violationId,
      deviceId,
      timestamp: timestamp || new Date(),
      gpsLocation,
      licensePlateText: licensePlateText || 'UNKNOWN',
      evidenceFileName,
      violationType: "Helmet Violation" // default type for your project
    });

    await violation.save();
    res.status(201).json({ message: "Violation logged successfully", id: violation.violationId });

  } catch (error) {
    console.error("❌ Failed to log violation:", error);

    // Handle duplicate ID error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Violation ID already exists." });
    }

    res.status(500).json({ error: "Internal server error while saving violation." });
  }
});


/* ============================================================
   2️⃣ GET /api/violations/me 
   Used by authenticated user to fetch their own chalans
============================================================ */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const vehicleNumber = req.user.vehicle;

    if (!vehicleNumber) {
      return res.status(400).json({ message: "User vehicle number not found in token." });
    }

    const chalans = await Violation.find({ licensePlateText: vehicleNumber })
      .sort({ timestamp: -1 });

    res.status(200).json(chalans);

  } catch (error) {
    console.error("❌ Failed to fetch user's violations:", error);
    res.status(500).json({ error: "Server error while fetching user's chalans." });
  }
});


/* ============================================================
   3️⃣ GET /api/violations
   Used by admin or public dashboard to fetch all violations
   Supports optional query filters like vehicle number, date range, etc.
============================================================ */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, vehicle, from, to } = req.query;
    const q = {};

    // Apply optional filters
    if (vehicle) q.licensePlateText = { $regex: vehicle, $options: 'i' };
    if (from || to) q.timestamp = {};
    if (from) q.timestamp.$gte = new Date(from);
    if (to) q.timestamp.$lte = new Date(to);

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Violation.find(q).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)).lean(),
      Violation.countDocuments(q)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });

  } catch (err) {
    console.error("❌ Failed to fetch violations:", err);
    res.status(500).json({ error: "Internal server error while fetching violations." });
  }
});

module.exports = router;
