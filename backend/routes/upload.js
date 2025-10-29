const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Violation = require('../models/Violation');
const { parseCsvFile, normalizeRowToViolation } = require('../utils/csvParseAndNormalize');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads/') });

router.post('/csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const rows = await parseCsvFile(req.file.path);
    const docs = rows.map(normalizeRowToViolation);
    const inserted = await Violation.insertMany(docs, { ordered: false });
    fs.unlinkSync(req.file.path);
    res.json({ status: 'ok', inserted: inserted.length });
  } catch (err) {
    console.error('CSV upload error', err);
    try { fs.unlinkSync(req.file.path); } catch(e){}
    res.status(500).json({ error: 'Failed to parse/save CSV', details: err.message });
  }
});

module.exports = router;
