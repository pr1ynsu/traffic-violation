// backend/utils/csvParseAndNormalize.js (Final Code Fix)

const fs = require('fs');
// This requires 'csv-parse' to be installed (npm install csv-parse)
const { parse } = require('csv-parse'); 

function parseCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
            .on('data', (row) => records.push(row))
            .on('end', () => resolve(records))
            .on('error', (err) => reject(err));
    });
}

function normalizeRowToViolation(row) {
    // This logic ensures the CSV data is correctly structured for MongoDB insertion
    const timestamp = row.timestamp || row.date || new Date().toISOString();
    const licensePlateText = row.vehicle_number || row.vehicle || row.plate || 'UNKNOWN';
    
    return {
        timestamp: new Date(timestamp),
        licensePlateText: licensePlateText, 
        raw: row 
    };
}

module.exports = { parseCsvFile, normalizeRowToViolation };
