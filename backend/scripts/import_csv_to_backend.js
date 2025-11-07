// backend/scripts/import_csv_to_backend.js
// Import violations from CSV file to backend endpoint

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const axios = require('axios');

// Add axios as dependency if not present
// npm install axios

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

async function importFromCSV(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV file not found: ${csvPath}`);
        process.exit(1);
    }

    console.log(`📄 Reading CSV file: ${csvPath}`);

    const records = [];
    const parser = fs.createReadStream(csvPath)
        .pipe(csv.parse({
            columns: true,
            skip_empty_lines: true
        }));

    for await (const record of parser) {
        records.push(record);
    }

    console.log(`📊 Found ${records.length} records in CSV`);

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
        try {
            // Transform CSV record to API format
            const violationData = {
                id: record.id,
                timestamp: record.timestamp,
                vehicle_number: record.vehicle_number,
                violation_code: parseInt(record.violation_code),
                violation_text: record.violation_text,
                offender_name: record.offender_name,
                challan_rupees: parseInt(record.challan_rupees),
                credits_rupees: parseInt(record.credits_rupees),
                photo_path: record.photo_path
            };

            // Resolve photo path relative to CSV directory
            const csvDir = path.dirname(absoluteCsvPath);
            // Correct the photo_path if it starts with "output\photos\" to "photos\"
            let correctedPhotoPath = violationData.photo_path;
            if (correctedPhotoPath.startsWith('output\\photos\\') || correctedPhotoPath.startsWith('output/photos/')) {
                correctedPhotoPath = correctedPhotoPath.replace(/^output[\/\\]photos[\/\\]/, 'photos/');
            }
            const resolvedPhotoPath = path.resolve(csvDir, correctedPhotoPath);

            // Check if photo file exists
            if (!fs.existsSync(resolvedPhotoPath)) {
                console.warn(`⚠️  Photo not found for ${violationData.id}: ${resolvedPhotoPath}`);
                continue;
            }

            // Update photo_path to resolved path
            violationData.photo_path = resolvedPhotoPath;

            // POST to API
            const response = await axios.post(`${API_BASE_URL}/api/violations`, violationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                console.log(`✅ Imported violation ${violationData.id}`);
                successCount++;
            }

        } catch (error) {
            console.error(`❌ Failed to import ${record.id}:`, error.response?.data?.error || error.message);
            errorCount++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📈 Import complete:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
}

// Main execution
const csvPath = process.argv[2];
if (!csvPath) {
    console.error('Usage: node import_csv_to_backend.js <path/to/violations.csv>');
    process.exit(1);
}

const absoluteCsvPath = path.resolve(csvPath);
importFromCSV(absoluteCsvPath).catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
});
