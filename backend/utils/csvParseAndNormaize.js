const fs = require('fs');
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
  const timestamp = row.timestamp || row.date || new Date().toISOString();
  const vehicle_number = row.vehicle_number || row.vehicle || row.plate || 'UNKNOWN';
  const violation_code = Number(row.violation_code || row.code || 0) || 0;
  const violation_text = row.violation_text || row.violation || row.rule || 'Unknown';
  const offender_name = row.offender_name || row.name || (row.offender && row.offender[0]) || 'X';
  const challan_rupees = Number(row.challan_rupees || row.penalty || row.fine || 0) || 0;
  const credits_rupees = Number(row.credits_rupees || row.credits || 0) || 0;

  return {
    timestamp: new Date(timestamp),
    vehicle_number,
    violation_code,
    violation_text,
    offender_name,
    challan_rupees,
    credits_rupees,
    raw: row
  };
}

module.exports = { parseCsvFile, normalizeRowToViolation };
