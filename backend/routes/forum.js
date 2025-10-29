const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const ForumMessage = require('../models/ForumMessage');
const router = express.Router();

router.post('/rooms', authMiddleware, async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  res.json({ ok: true, roomId });
});

router.get('/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, before } = req.query;
  const q = { roomId };
  if (before) q.createdAt = { $lt: new Date(before) };
  const messages = await ForumMessage.find(q).sort({ createdAt: -1 }).limit(Number(limit)).lean();
  res.json({ messages: messages.reverse() });
});

module.exports = router;
