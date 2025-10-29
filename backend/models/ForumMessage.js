const mongoose = require('mongoose');

const ForumMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  meta: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('ForumMessage', ForumMessageSchema);
