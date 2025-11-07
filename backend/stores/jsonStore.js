const fs = require('fs').promises;
const path = require('path');

class JsonStore {
    constructor(storageDir = './storage') {
        this.storageDir = storageDir;
        this.violationsFile = path.join(storageDir, 'violations.json');
        this.violations = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Ensure storage directory exists
            await fs.mkdir(this.storageDir, { recursive: true });

            // Try to load existing data
            try {
                const data = await fs.readFile(this.violationsFile, 'utf8');
                this.violations = JSON.parse(data);
            } catch (err) {
                // File doesn't exist or is invalid, start with empty array
                this.violations = [];
                await this._save();
            }

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize JSON store:', error);
            throw error;
        }
    }

    async _save() {
        try {
            await fs.writeFile(this.violationsFile, JSON.stringify(this.violations, null, 2));
        } catch (error) {
            console.error('Failed to save violations to JSON:', error);
            throw error;
        }
    }

    async create(violationData) {
        await this.init();

        // Check for duplicate ID
        const existing = this.violations.find(v => v.id === violationData.id);
        if (existing) {
            throw new Error(`Violation with ID ${violationData.id} already exists`);
        }

        // Add timestamps
        const violation = {
            ...violationData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.violations.push(violation);
        await this._save();

        return violation;
    }

    async find(query = {}, options = {}) {
        await this.init();

        let results = [...this.violations];

        // Apply filters from buildQuery
        Object.keys(query).forEach(key => {
            if (key === '$or') {
                results = results.filter(v =>
                    query.$or.some(condition => {
                        const field = Object.keys(condition)[0];
                        const regex = condition[field].$regex;
                        const options = condition[field].$options;
                        const value = v[field];
                        if (!value) return false;
                        const flags = options ? options : '';
                        return new RegExp(regex, flags).test(value);
                    })
                );
            } else if (key === 'credits_rupees' && query[key].$gt !== undefined) {
                results = results.filter(v => v[key] > query[key].$gt);
            } else if (key === 'timestamp') {
                if (query[key].$gte) {
                    results = results.filter(v => new Date(v[key]) >= query[key].$gte);
                }
                if (query[key].$lte) {
                    results = results.filter(v => new Date(v[key]) <= query[key].$lte);
                }
            } else if (typeof query[key] === 'object' && query[key].$regex) {
                const regex = new RegExp(query[key].$regex, query[key].$options || '');
                results = results.filter(v => regex.test(v[key]));
            } else if (typeof query[key] !== 'object') {
                results = results.filter(v => v[key] === query[key]);
            }
        });

        // Apply sorting (default: timestamp desc)
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply pagination
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const skip = (page - 1) * limit;
        const paginatedResults = results.slice(skip, skip + limit);

        return {
            data: paginatedResults,
            total: results.length,
            page,
            limit,
            totalPages: Math.ceil(results.length / limit)
        };
    }

    async findById(id) {
        await this.init();
        return this.violations.find(v => v.id === id);
    }

    async update(id, updateData) {
        await this.init();

        const index = this.violations.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error(`Violation with ID ${id} not found`);
        }

        this.violations[index] = {
            ...this.violations[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await this._save();
        return this.violations[index];
    }

    async delete(id) {
        await this.init();

        const index = this.violations.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error(`Violation with ID ${id} not found`);
        }

        const deleted = this.violations.splice(index, 1)[0];
        await this._save();
        return deleted;
    }
}

module.exports = JsonStore;
