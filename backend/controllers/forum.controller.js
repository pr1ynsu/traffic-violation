// backend/controllers/forum.controller.js
const ForumMessage = require('../models/ForumMessage');

// ✅ Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id || 'anonymous';
    const authorName = req.user?.name || 'Guest';

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const newPost = await ForumMessage.create({
      title,
      content,
      authorId: userId,
      authorName,
    });

    res.status(201).json({ message: 'Post created successfully!', post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error creating post.' });
  }
};

// ✅ Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await ForumMessage.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server error fetching posts.' });
  }
};

// ✅ Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await ForumMessage.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    res.status(500).json({ message: 'Server error fetching post.' });
  }
};

// ✅ Delete post
const deletePost = async (req, res) => {
  try {
    const post = await ForumMessage.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error deleting post.' });
  }
};

// ✅ Export all functions
module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
};
