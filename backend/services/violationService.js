// backend/services/violationService.js - Query helpers and aggregations

const Violation = require('../models/Violation');
const JsonStore = require('../stores/jsonStore');
const MongoStore = require('../stores/mongoStore');

const useMongo = process.env.USE_MONGO === 'true';
const store = useMongo ? new MongoStore() : new JsonStore(process.env.STORAGE_DIR || './storage');

// Build query object from request params
function buildQuery(req) {
  const { from, to, verified, violation_code, vehicle, created_by, search, type } = req.query;
  const query = {};

  if (from || to) {
    query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from);
    if (to) query.timestamp.$lte = new Date(to);
  }

  if (verified !== undefined && verified !== 'all') {
    query.verified = verified === 'true';
  }

  if (violation_code) {
    query.violation_code = parseInt(violation_code);
  }

  if (vehicle) {
    query.vehicle_number = { $regex: vehicle, $options: 'i' };
  }

  if (created_by) {
    query.created_by = created_by;
  }

  if (search) {
    query.$or = [
      { vehicle_number: { $regex: search, $options: 'i' } },
      { offender_name: { $regex: search, $options: 'i' } },
      { id: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle type filter for dashboard pages
  if (type === 'credits') {
    query.credits_rupees = { $gt: 0 };
  }
  // 'all' and 'violations' show all records (no additional filter)

  return query;
}

// Get violations with filtering and pagination
async function getViolations(req) {
  const query = buildQuery(req);
  const { page = 1, limit = process.env.PAGE_SIZE_DEFAULT || 20, sortBy = 'timestamp', sortDir = 'desc' } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await store.find(query, options);

  return {
    data: result.data,
    meta: {
      page: result.page,
      pageSize: result.limit,
      totalPages: result.totalPages,
      total: result.total
    }
  };
}

// Get dashboard summary for government
async function getGovSummary(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const todayQuery = { timestamp: { $gte: startOfDay, $lte: endOfDay } };
  const allViolations = await store.findAll({});

  const new_verified_today = await store.count({ ...todayQuery, verified: true });
  const total_violations_today = await store.count(todayQuery);
  const total_outstanding_challans = await store.count({ verified: false });

  // Violations by type
  const violations_by_type = [];
  const typeCounts = {};
  allViolations.forEach(v => {
    const code = v.violation_code;
    if (!typeCounts[code]) {
      typeCounts[code] = { code, text: v.violation_text, count: 0 };
    }
    typeCounts[code].count++;
  });
  Object.values(typeCounts).forEach(type => violations_by_type.push(type));

  return {
    date,
    new_verified_today,
    total_violations_today,
    total_outstanding_challans,
    violations_by_type
  };
}

// Get dashboard summary for user
async function getUserSummary(userId) {
  const userViolations = await store.findAll({ vehicle_number: userId });
  const totalViolations = userViolations.length;
  const verifiedCount = userViolations.filter(v => v.verified).length;
  const outstandingChallans = userViolations.filter(v => !v.verified).length;
  const totalCredits = userViolations.reduce((sum, v) => sum + v.credits_rupees, 0);

  return {
    totalViolations,
    verifiedCount,
    outstandingChallans,
    totalCredits
  };
}

// Mark violation as verified
async function verifyViolation(id) {
  const violations = await store.findAll({ id });
  if (violations.length === 0) {
    throw new Error('Violation not found');
  }

  const violation = violations[0];
  violation.verified = true;
  violation.verified_at = new Date();

  await store.save(violation);
  return violation;
}

module.exports = {
  getViolations,
  getGovSummary,
  getUserSummary,
  verifyViolation
};
