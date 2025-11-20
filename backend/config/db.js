// backend/config/db.js (Final Resolved Version)

const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Connection Established Successfully!");
    } catch (err) {
        // CRITICAL: Keep these two lines for robust error handling
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1); // Exit process with failure if DB connection fails
    }
};

module.exports = { connectDB };
