// backend/controllers/violations.controller.js - Updated for new ingestion endpoint

const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const JsonStore = require('../stores/jsonStore');
const MongoStore = require('../stores/mongoStore');
const violationService = require('../services/violationService');

// Initialize storage adapters
const jsonStore = new JsonStore(process.env.STORAGE_DIR || './storage');
const mongoStore = new MongoStore();

// Determine which store to use based on environment
const useMongo = process.env.USE_MONGO === 'true';
const store = useMongo ? mongoStore : jsonStore;

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.env.STORAGE_DIR || './storage', 'violations');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Sanitize filename: prefix with record ID + timestamp to avoid collisions
        const recordId = req.body.id || `temp_${Date.now()}`;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${recordId}_${timestamp}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// ** 1. POST /api/violations - Create new violation (JSON or multipart) **
async function createViolation(req, res) {
    try {
        let violationData;

        if (req.file) {
            // Multipart form-data with photo upload
            const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : req.body;
            violationData = {
                ...metadata,
                photo_path: req.file.path
            };
        } else {
            // JSON body with photo_path
            violationData = req.body;
        }

        // Ensure violationData is defined
        if (!violationData) {
            return res.status(400).json({ error: 'No violation data provided' });
        }

        // Validate required fields
        const requiredFields = ['id', 'timestamp', 'vehicle_number', 'violation_code', 'violation_text', 'offender_name', 'challan_rupees', 'credits_rupees'];
        const missing = requiredFields.filter(field => !violationData[field]);
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // For JSON POST, photo_path is required
        if (!req.file && !violationData.photo_path) {
            return res.status(400).json({ error: 'Photo path is required for JSON POST' });
        }

        // Ensure photo file exists (if provided via photo_path)
        if (!req.file && violationData.photo_path) {
            try {
                await fs.access(violationData.photo_path);
            } catch (error) {
                return res.status(400).json({ error: 'Photo file does not exist at specified path' });
            }
        }

        // Save to store
        const savedViolation = await store.create(violationData);

        console.log(`✅ Violation ${violationData.id} created successfully`);
        res.status(201).json({
            message: 'Violation created successfully',
            id: violationData.id,
            photo_path: violationData.photo_path
        });

    } catch (error) {
        console.error('❌ Failed to create violation:', error);

        // Handle duplicate key error
        if (error.message.includes('already exists') || error.code === 11000) {
            return res.status(409).json({ error: 'Violation with this ID already exists' });
        }

        res.status(500).json({ error: 'Internal server error while creating violation' });
    }
}

// ** 2. GET /api/violations/me - Get user's violations (protected) **
async function getUserViolations(req, res) {
    try {
        const vehicleNumber = req.user.vehicle;
        if (!vehicleNumber) {
            return res.status(400).json({ error: 'User vehicle number not found' });
        }

        const violations = await store.findAll({ vehicle_number: vehicleNumber });
        res.json(violations);

    } catch (error) {
        console.error('❌ Failed to fetch user violations:', error);
        res.status(500).json({ error: 'Internal server error while fetching violations' });
    }
}

// ** 3. GET /api/violations - Get all violations (with advanced filters) **
async function getAllViolations(req, res) {
    try {
        const { type = 'violations', owner, q: searchQuery } = req.query;

        // Add type and search filters to req.query for violationService
        req.query.type = type;
        req.query.q = searchQuery;

        // Handle owner filter (for user dashboard)
        if (owner === 'me' && req.user) {
            req.query.vehicle = req.user.vehicle;
        }

        const result = await violationService.getViolations(req);
        res.json(result);
    } catch (error) {
        console.error('❌ Failed to fetch violations:', error);
        res.status(500).json({ error: 'Internal server error while fetching violations' });
    }
}

// ** 4. PATCH /api/violations/:id/verify - Verify a violation (government only) **
async function verifyViolation(req, res) {
    try {
        const { id } = req.params;
        const violation = await violationService.verifyViolation(id);
        res.json({ message: 'Violation verified successfully', violation });
    } catch (error) {
        console.error('❌ Failed to verify violation:', error);
        if (error.message === 'Violation not found') {
            return res.status(404).json({ error: 'Violation not found' });
        }
        res.status(500).json({ error: 'Internal server error while verifying violation' });
    }
}

module.exports = {
    createViolation,
    getUserViolations,
    getAllViolations,
    verifyViolation,
    upload // Export multer middleware for routes
};
