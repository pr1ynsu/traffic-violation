// backend/models/ForumMessage.js
const mongoose = require('mongoose');

const ForumMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links post to user
    required: false,
  },
  authorName: {
    type: String,
    default: 'Anonymous',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ForumMessage', ForumMessageSchema);

