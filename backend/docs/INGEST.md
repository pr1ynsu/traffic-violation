# Violations Ingestion Documentation

This document explains how to ingest traffic violation data into the backend system.

## Overview

The backend provides a robust `POST /api/violations` endpoint that accepts traffic violation records from the ML system or direct API calls. It supports two input formats and uses interchangeable storage adapters.

## Endpoint: POST /api/violations

### Input Formats

#### 1. JSON Body (for existing photo files)
Send a JSON payload with all violation data including a `photo_path` pointing to an existing file.

```bash
curl -X POST http://localhost:8000/api/violations \
  -H "Content-Type: application/json" \
  -d '{
    "id": "abc123",
    "timestamp": "2025-01-07T12:00:00Z",
    "vehicle_number": "ABC123",
    "violation_code": 101,
    "violation_text": "Speeding above limit",
    "offender_name": "A",
    "challan_rupees": 1000,
    "credits_rupees": 100,
    "photo_path": "/path/to/existing/photo.jpg"
  }'
```

#### 2. Multipart Form-Data (with photo upload)
Upload a photo file along with metadata JSON.

```bash
curl -X POST http://localhost:8000/api/violations \
  -F "photo=@/path/to/photo.jpg" \
  -F 'metadata={
    "id": "def456",
    "timestamp": "2025-01-07T12:00:00Z",
    "vehicle_number": "XYZ789",
    "violation_code": 102,
    "violation_text": "Running red light",
    "offender_name": "B",
    "challan_rupees": 2000,
    "credits_rupees": 200
  }'
```

### Required Fields
- `id`: Unique identifier (string)
- `timestamp`: ISO 8601 timestamp (string)
- `vehicle_number`: Vehicle license plate (string)
- `violation_code`: Numeric violation code (number)
- `violation_text`: Violation description (string)
- `offender_name`: Single letter offender identifier (string)
- `challan_rupees`: Challan amount (number)
- `credits_rupees`: Credits amount (number)
- `photo_path`: Path to photo file (string, or uploaded via multipart)

### Response
Success (201):
```json
{
  "message": "Violation created successfully",
  "id": "abc123",
  "photo_url": "/path/to/photo.jpg"
}
```

Error responses:
- 400: Missing required fields or invalid photo path
- 409: Duplicate violation ID
- 500: Internal server error

## Storage Adapters

The system uses interchangeable storage adapters controlled by the `USE_MONGO` environment variable.

### JSON Store (Default)
- Stores violations in `storage/violations.json`
- No external dependencies
- Suitable for development and small-scale use

### MongoDB Store
- Uses Mongoose to store in MongoDB
- Set `USE_MONGO=true` and provide `MONGO_URI`
- Suitable for production

## Migration to MongoDB

1. Ensure MongoDB is running and accessible
2. Set environment variables:
   ```bash
   USE_MONGO=true
   MONGO_URI=mongodb://localhost:27017/traffic_violation_db
   ```
3. Restart the server
4. Existing JSON data will not be migrated automatically - use the import script if needed

## Import Script

Use `scripts/import_csv_to_backend.js` to import violations from the ML system's CSV output:

```bash
cd backend
node scripts/import_csv_to_backend.js ../ml/output/violations.csv
```

This script reads the CSV file and POSTs each record to the `/api/violations` endpoint.

## Environment Variables

- `USE_MONGO`: Set to `true` to use MongoDB store (default: false)
- `MONGO_URI`: MongoDB connection string (required if USE_MONGO=true)
- `STORAGE_DIR`: Directory for file storage (default: './storage')
- `PORT`: Server port (default: 8000)

## Photo Storage

- Photos are stored in `{STORAGE_DIR}/violations/`
- Filenames are prefixed with record ID and timestamp to prevent collisions
- Only image files are accepted (max 10MB)
- Photos are not processed beyond copying to storage

## Testing

Run tests with:
```bash
cd backend
npm test
```

Tests cover both JSON and multipart POST flows, validation, and error handling.
