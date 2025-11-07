require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const { connectDB } = require('./config/db');
const ForumMessage = require('./models/ForumMessage');
const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const violationsRoutes = require('./routes/violations');
const forumRoutes = require('./routes/forum');
const dashboardRoutes = require('./routes/dashboard');
// ⚠️ If you don’t have an upload.js file yet, comment the line below
// const uploadRoutes = require('./routes/upload');

// Rate limiter
const rateLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});



const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/traffic_violation_db';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';
const STORAGE_DIR = process.env.STORAGE_DIR || './storage';

// Ensure storage directory exists
(async () => {
  try {
    await fs.mkdir(path.join(STORAGE_DIR, 'violations'), { recursive: true });
    console.log(`✅ Storage directory ready: ${STORAGE_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create storage directory:', error);
  }
})();

const app = express();
const server = http.createServer(app);

// 🧱 Middleware setup
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(cors({ origin: CORS_ORIGIN }));

// 🧩 Connect to MongoDB conditionally
if (process.env.USE_MONGO === 'true') {
    connectDB(MONGO_URI);
    console.log('✅ MongoDB mode enabled');
} else {
    console.log('✅ JSON store mode enabled');
}

// 🛣️ Routes
app.use('/api/auth', authRoutes);
// app.use('/api/upload', uploadRoutes); // Uncomment when upload.js is added
app.use('/api/violations', violationsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// 🧠 Socket.IO setup
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});

io.of('/forum').use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) return next(new Error('User not found'));
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.of('/forum').on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`✅ Socket connected: ${user.email}`);

  socket.on('join', (roomId) => {
    socket.join(roomId);
  });

  socket.on('message', async (payload) => {
    const { roomId, text, meta } = payload;
    if (!roomId || !text) return;

    const msg = await ForumMessage.create({
      roomId,
      authorId: user._id,
      authorName: user.name,
      text,
      meta: meta || {},
    });

    io.of('/forum').to(roomId).emit('message', {
      id: msg._id,
      roomId: msg.roomId,
      authorId: msg.authorId,
      authorName: msg.authorName,
      text: msg.text,
      createdAt: msg.createdAt,
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${user.email}`);
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
