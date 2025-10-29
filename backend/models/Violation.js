const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, index: true },
  vehicle_number: { type: String, required: true, index: true },
  violation_code: { type: Number, required: true },
  violation_text: { type: String, required: true },
  offender_name: { type: String },
  challan_rupees: { type: Number, required: true },
  credits_rupees: { type: Number, default: 0 },
  source: { type: String, default: 'ml' },
  raw: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Violation', ViolationSchema);
