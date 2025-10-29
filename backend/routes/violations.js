const express = require('express');
const Violation = require('../models/Violation');

const router = express.Router();

// GET /api/violations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, vehicle, from, to } = req.query;
    const q = {};
    if (vehicle) q.vehicle_number = { $regex: vehicle, $options: 'i' };
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
