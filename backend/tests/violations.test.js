// backend/tests/violations.test.js

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const violationsRoutes = require('../routes/violations');

// Create test app with temporary storage
const testStorageDir = path.join(__dirname, 'test-storage');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For multipart

// Override environment for test storage
process.env.STORAGE_DIR = testStorageDir;
process.env.USE_MONGO = 'false';

// Clear storage before each test suite
beforeAll(async () => {
    try {
        await fs.rm(testStorageDir, { recursive: true, force: true });
    } catch (error) {
        // Ignore if directory doesn't exist
    }
});

app.use('/api/violations', violationsRoutes);

// Mock data
const mockViolation = {
    id: 'test123',
    timestamp: '2025-01-07T12:00:00Z',
    vehicle_number: 'ABC123',
    violation_code: 101,
    violation_text: 'Speeding above limit',
    offender_name: 'A',
    challan_rupees: 1000,
    credits_rupees: 100,
    photo_path: path.join(testStorageDir, 'test-photo.jpg')
};

describe('POST /api/violations', () => {
    beforeEach(async () => {
        // Clear test storage
        try {
            await fs.rm(testStorageDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore if directory doesn't exist
        }
        await fs.mkdir(testStorageDir, { recursive: true });

        // Create test photo file
        await fs.writeFile(mockViolation.photo_path, 'fake photo data');
    });

    describe('JSON POST', () => {
        test('should create violation with valid JSON data', async () => {
            const response = await request(app)
                .post('/api/violations')
                .send(mockViolation)
                .expect(201);

            expect(response.body.message).toBe('Violation created successfully');
            expect(response.body.id).toBe('test123');
        });

        test('should return 400 for missing required fields', async () => {
            const invalidData = { ...mockViolation };
            delete invalidData.id;

            const response = await request(app)
                .post('/api/violations')
                .send(invalidData)
                .expect(400);

            expect(response.body.error).toContain('Missing required fields');
        });

        test('should return 409 for duplicate violation ID', async () => {
            // First create the violation
            await request(app)
                .post('/api/violations')
                .send(mockViolation)
                .expect(201);

            // Try to create again with same ID
            const response = await request(app)
                .post('/api/violations')
                .send(mockViolation)
                .expect(409);

            expect(response.body.error).toBe('Violation with this ID already exists');
        });

        test('should create violation with different ID after duplicate', async () => {
            // First create the violation
            await request(app)
                .post('/api/violations')
                .send(mockViolation)
                .expect(201);

            // Try to create again with same ID (should fail)
            await request(app)
                .post('/api/violations')
                .send(mockViolation)
                .expect(409);

            // Create with different ID (should succeed)
            const differentViolation = { ...mockViolation, id: 'test124' };
            const response = await request(app)
                .post('/api/violations')
                .send(differentViolation)
                .expect(201);

            expect(response.body.message).toBe('Violation created successfully');
            expect(response.body.id).toBe('test124');
        });
    });

    describe('Multipart POST', () => {
        test('should create violation with photo upload', async () => {
            // Create a temporary test image file
            const testImagePath = path.join(__dirname, 'test-image.jpg');
            await fs.writeFile(testImagePath, 'fake image data');

            const metadata = {
                id: 'test456',
                timestamp: '2025-01-07T12:00:00Z',
                vehicle_number: 'XYZ789',
                violation_code: 102,
                violation_text: 'Running red light',
                offender_name: 'B',
                challan_rupees: 2000,
                credits_rupees: 200
            };

            const response = await request(app)
                .post('/api/violations')
                .field('metadata', JSON.stringify(metadata))
                .attach('photo', testImagePath)
                .expect(201);

            expect(response.body.message).toBe('Violation created successfully');
            expect(response.body.id).toBe('test456');

            // Clean up
            await fs.unlink(testImagePath);
        });

        test('should reject non-image files', async () => {
            const testFilePath = path.join(__dirname, 'test-text.txt');
            await fs.writeFile(testFilePath, 'not an image');

            const response = await request(app)
                .post('/api/violations')
                .field('metadata', JSON.stringify(mockViolation))
                .attach('photo', testFilePath)
                .expect(400);

            // Clean up
            await fs.unlink(testFilePath);
        });
    });
});

describe('GET /api/violations', () => {
    beforeEach(async () => {
        // Clear test storage and create a violation for GET tests
        try {
            await fs.rm(testStorageDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore if directory doesn't exist
        }
        await fs.mkdir(testStorageDir, { recursive: true });

        // Create test photo file
        await fs.writeFile(mockViolation.photo_path, 'fake photo data');

        // Create a violation for GET tests
        await request(app)
            .post('/api/violations')
            .send(mockViolation);
    });

    test('should return violations with pagination', async () => {
        const response = await request(app)
            .get('/api/violations')
            .query({ page: 1, limit: 10 })
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.pageSize).toBe(10);
    });

    test('should filter by vehicle number', async () => {
        const response = await request(app)
            .get('/api/violations')
            .query({ vehicle: 'ABC123' })
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
