// backend/routes/violations.js
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const {
    createViolation,
    getUserViolations,
    getAllViolations,
    verifyViolation,
    upload
} = require('../controllers/violations.controller');

const router = express.Router();

/* ============================================================
   1️⃣ POST /api/violations
   Create a new violation record. Accepts either:
   - JSON body with all fields including photo_path
   - Multipart form-data with 'photo' file and 'metadata' JSON field
============================================================ */
router.post('/', (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, createViolation);

/* ============================================================
   2️⃣ GET /api/violations/me
   Get authenticated user's violations (by vehicle number)
============================================================ */
router.get('/me', protect, getUserViolations);

/* ============================================================
   3️⃣ GET /api/violations
   Get all violations with optional filters and pagination
   Query params: page, limit, vehicle, from, to, verified, violation_code, search
============================================================ */
router.get('/', getAllViolations);

/* ============================================================
   4️⃣ PATCH /api/violations/:id/verify
   Verify a violation (government only)
============================================================ */
router.patch('/:id/verify', protect, requireRole('government'), verifyViolation);

module.exports = router;
