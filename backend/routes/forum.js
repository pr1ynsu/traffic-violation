// backend/routes/forum.js

const express = require('express');
const router = express.Router();

// ✅ Correct import path (single slash)
const forumController = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth');

console.log("🧩 protect middleware:", typeof protect);

// ✅ Destructure after confirming import
const { createPost, getAllPosts, getPostById, deletePost } = forumController;

// ✅ Create a new forum post
router.post('/', protect, createPost);

// ✅ Get all forum posts
router.get('/', getAllPosts);

// ✅ Get a single post by ID
router.get('/:id', getPostById);

// ✅ Delete a post (admin or user)
router.delete('/:id', protect, deletePost);

module.exports = router;
