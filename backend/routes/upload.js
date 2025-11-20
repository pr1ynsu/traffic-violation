// backend/routes/upload.js (Final Combined Logic - CommonJS)

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Violation = require('../models/Violation');
// Assuming the utility file is already created and correct
const { parseCsvFile, normalizeRowToViolation } = require('../utils/csvParseAndNormalize'); 

const router = express.Router();

// Define Multer for temporary file storage
// NOTE: Files are temporarily stored in 'uploads/' next to the backend folder
const upload = multer({ dest: path.join(__dirname, '..', 'uploads/') }); 

// ** 1. POST /api/upload/csv (Bulk Data Ingestion) **
// This is the robust logic you provided.
router.post('/csv', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    try {
        const rows = await parseCsvFile(req.file.path);
        
        // IMPORTANT: The normalization function here needs to match the Violation model's fields 
        // (violationId, licensePlateText, evidenceFileName, etc.) for insertion.
        const docs = rows.map(normalizeRowToViolation); 
        
        // Final insertion into MongoDB
        const inserted = await Violation.insertMany(docs, { ordered: false });
        
        fs.unlinkSync(req.file.path); // Clean up temporary file
        res.json({ status: 'ok', inserted: inserted.length });

    } catch (err) {
        console.error('CSV upload error', err);
        try { fs.unlinkSync(req.file.path); } catch(e){} 
        res.status(500).json({ error: 'Failed to parse/save CSV', details: err.message });
    }
});


// ** 2. POST /api/upload (General Single File Upload)**
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    // In a final setup, this file would be moved from 'uploads/' to the final 'public/uploads' folder.
    // For now, we return the path to confirm success.
    res.json({ 
        message: 'File uploaded successfully', 
        filePath: req.file.path // Path where multer saved the file temporarily
    });
});


module.exports = router;