// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/gov/summary - Government summary (protected, government only)
router.get('/gov/summary', protect, requireRole('government'), dashboardController.getGovSummary);

// GET /api/dashboard/user - User summary (protected, user only)
router.get('/user', protect, requireRole('user'), dashboardController.getUserSummary);

module.exports = router;
