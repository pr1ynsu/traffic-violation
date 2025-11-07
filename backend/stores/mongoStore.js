// backend/stores/mongoStore.js - MongoDB storage adapter using Mongoose

const mongoose = require('mongoose');
const Violation = require('../models/Violation');

class MongoStore {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Ensure MongoDB connection is established
        if (mongoose.connection.readyState !== 1) {
            const mongoUri = process.env.MONGO_URI;
            if (!mongoUri) {
                throw new Error('MONGO_URI environment variable is required when USE_MONGO=true');
            }

            try {
                await mongoose.connect(mongoUri);
                console.log('✅ MongoDB connection established');
            } catch (error) {
                console.error('❌ MongoDB connection failed:', error.message);
                throw error;
            }
        }

        this.initialized = true;
        console.log('✅ MongoDB store initialized');
    }

    async create(violationData) {
        await this.init();

        try {
            const newViolation = new Violation(violationData);
            await newViolation.save();
            console.log(`✅ Violation ${violationData.id} saved to MongoDB`);
            return newViolation;
        } catch (error) {
            console.error('❌ Failed to save violation to MongoDB:', error);

            // Handle duplicate key error
            if (error.code === 11000) {
                throw new Error(`Violation with ID ${violationData.id} already exists`);
            }

            throw error;
        }
    }

    async find(query = {}, options = {}) {
        await this.init();

        const mongoQuery = {};

        // Apply filters from buildQuery
        Object.keys(query).forEach(key => {
            if (key === '$or') {
                mongoQuery.$or = query.$or;
            } else if (key === 'credits_rupees' && query[key].$gt !== undefined) {
                mongoQuery.credits_rupees = { $gt: query[key].$gt };
            } else if (key === 'timestamp') {
                mongoQuery.timestamp = {};
                if (query[key].$gte) mongoQuery.timestamp.$gte = query[key].$gte;
                if (query[key].$lte) mongoQuery.timestamp.$lte = query[key].$lte;
            } else if (key === 'vehicle_number' && query[key].$regex) {
                mongoQuery.vehicle_number = new RegExp(query[key].$regex, query[key].$options || '');
            } else if (key === 'offender_name' && query[key].$regex) {
                mongoQuery.offender_name = new RegExp(query[key].$regex, query[key].$options || '');
            } else if (key === 'id' && query[key].$regex) {
                mongoQuery.id = new RegExp(query[key].$regex, query[key].$options || '');
            } else if (typeof query[key] !== 'object') {
                mongoQuery[key] = query[key];
            }
        });

        // Handle type filter for dashboard pages
        if (query.type === 'credits') {
            mongoQuery.credits_rupees = { $gt: 0 };
        }
        // 'all' and 'violations' show all records (no additional filter)

        // Apply pagination
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Violation.find(mongoQuery)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Violation.countDocuments(mongoQuery)
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findById(id) {
        await this.init();
        return await Violation.findOne({ id }).lean();
    }

    async update(id, updateData) {
        await this.init();

        try {
            const updated = await Violation.findOneAndUpdate(
                { id },
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
            if (!updated) {
                throw new Error(`Violation with ID ${id} not found`);
            }
            return updated;
        } catch (error) {
            console.error('❌ Failed to update violation in MongoDB:', error);
            throw error;
        }
    }

    async delete(id) {
        await this.init();

        try {
            const deleted = await Violation.findOneAndDelete({ id });
            if (!deleted) {
                throw new Error(`Violation with ID ${id} not found`);
            }
            return deleted;
        } catch (error) {
            console.error('❌ Failed to delete violation from MongoDB:', error);
            throw error;
        }
    }

    // Additional methods for dashboard aggregations
    async aggregateForDashboard(dateRange) {
        await this.init();

        // Example aggregation for dashboard summary
        const pipeline = [
            {
                $match: {
                    timestamp: {
                        $gte: new Date(dateRange.start),
                        $lte: new Date(dateRange.end)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViolations: { $sum: 1 },
                    totalChallan: { $sum: '$challan_rupees' },
                    totalCredits: { $sum: '$credits_rupees' },
                    verifiedCount: { $sum: { $cond: ['$verified', 1, 0] } }
                }
            }
        ];

        const result = await Violation.aggregate(pipeline);
        return result[0] || {
            totalViolations: 0,
            totalChallan: 0,
            totalCredits: 0,
            verifiedCount: 0
        };
    }
}

module.exports = MongoStore;
