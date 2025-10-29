const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  credits: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
