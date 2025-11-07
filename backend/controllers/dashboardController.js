// backend/controllers/dashboardController.js

const violationService = require('../services/violationService');

// GET /api/dashboard/gov/summary?date=2025-11-07
async function getGovSummary(req, res) {
  try {
    const { date } = req.query;
    const summaryDate = date ? new Date(date) : new Date();

    const summary = await violationService.getGovSummary(summaryDate);
    res.json(summary);
  } catch (error) {
    console.error('❌ Failed to get government summary:', error);
    res.status(500).json({ error: 'Internal server error while fetching government summary' });
  }
}

// GET /api/dashboard/user
async function getUserSummary(req, res) {
  try {
    const userId = req.user.id; // Assuming JWT payload has user ID
    const summary = await violationService.getUserSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('❌ Failed to get user summary:', error);
    res.status(500).json({ error: 'Internal server error while fetching user summary' });
  }
}

module.exports = {
  getGovSummary,
  getUserSummary
};
