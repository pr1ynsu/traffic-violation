// backend/routes/violations.js
const express = require('express');
const Violation = require('../models/Violation');
const { protect } = require('../middleware/auth'); // ✅ Correct import name
const { parseCsvFile } = require('../utils/csvParseAndNormaize');

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
router.get('/me', protect, async (req, res) => { // ✅ Changed to protect
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
   Returns ALL rows from violations.csv, mapped to camelCase JSON fields, with proofImageUrl
============================================================ */
router.get('/', async (req, res) => {
  try {
    const csvPath = require('path').join(__dirname, '../data/violations.csv');
    const rawRows = await parseCsvFile(csvPath);

    // Normalize to camelCase fields and add proofImageUrl
    const normalized = rawRows.map(row => {
      const mapped = {
        id: row.id,
        timestamp: row.timestamp,
        vehicleNumber: row.vehicle_number,
        violationCode: row.violation_code,
        violationText: row.violation_text,
        offenderName: row.offender_name,
        challanRupees: parseFloat(row.challan_rupees) || 0,
        creditsRupees: parseFloat(row.credits_rupees) || 0,
        proofImage: row.proof_image
      };

      // Add proofImageUrl if proof_image exists
      if (mapped.proofImage) {
        const filename = mapped.proofImage.split('/').pop(); // Extract filename from path like "proof_images/c053f2cc.jpg"
        mapped.proofImageUrl = `/proof_image/${filename}`;
      } else {
        mapped.proofImageUrl = null;
      }

      return mapped;
    });

    res.json(normalized);
  } catch (error) {
    console.error("❌ Failed to fetch violations from CSV:", error);
    res.status(500).json({ error: "Internal server error while fetching CSV data." });
  }
});

const path = require('path');

// Routes to serve static files for testing
router.get('/data/:filename', (req, res) => {
  const filename = req.params.filename;
  if (filename === 'violations.csv') {
    res.sendFile(path.join(__dirname, '../data/violations.csv'));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/violations.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../../ml/violations_sample.json'));
});

router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, '../../ml/proof_image', filename), (err) => {
    if (err) res.status(404).json({ error: 'Image not found' });
  });
});

/* ============================================================
   4️⃣ GET /api/violations/csv
   Fetch all violations from CSV for government pages
============================================================ */
router.get('/csv', async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../data/violations.csv');
    const rawRows = await parseCsvFile(csvPath);

    // Normalize to camelCase fields
    const normalized = rawRows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      vehicleNumber: row.vehicle_number,
      violationCode: row.violation_code,
      violationText: row.violation_text,
      offenderName: row.offender_name,
      challanRupees: parseFloat(row.challan_rupees) || 0,
      creditsRupees: parseFloat(row.credits_rupees) || 0,
      proofImage: row.proof_image
    }));

    res.json(normalized);
  } catch (error) {
    console.error("❌ Failed to fetch CSV violations:", error);
    res.status(500).json({ error: "Internal server error while fetching CSV data." });
  }
});

module.exports = router;
