# TODO: Implement Violations Ingestion System

## Approved Plan Steps
- [x] Update models/Violation.js to match CSV schema (id, timestamp, vehicle_number, violation_code, violation_text, offender_name, challan_rupees, credits_rupees, photo_path)
- [x] Create stores/jsonStore.js: Append to JSON file or CSV, store records in array/object
- [x] Create stores/mongoStore.js: Skeleton using Mongoose Violation model
- [x] Update controllers/violations.controller.js: Handle POST with JSON or multipart, use stores based on USE_MONGO env
- [x] Update routes/violations.js: Use new controller, support JSON and multipart
- [x] Create storage/violations/ directory
- [x] Add jest, supertest to devDeps in package.json; add "test" script
- [x] Create tests/violations.test.js: Test POST JSON and multipart
- [x] Create docs/INGEST.md: Explain ingestion methods, migration to Mongo
- [x] Create scripts/import_csv_to_backend.js: Read CSV, POST to endpoint
- [x] Update .env.example: Add MONGO_URI, USE_MONGO, STORAGE_DIR, PORT
- [x] Update server.js: Ensure storage dir creation

## Followup Steps
- [x] Install new deps (jest, supertest)
- [x] Run tests
- [x] Test import script
- [x] Verify photo storage
- [x] Start server successfully
