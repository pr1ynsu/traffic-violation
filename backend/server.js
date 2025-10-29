require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const rateLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const violationsRoutes = require('./routes/violations');
const forumRoutes = require('./routes/forum');

const ForumMessage = require('./models/ForumMessage');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/traffic_violation_db';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(cors({ origin: CORS_ORIGIN }));

connectDB(MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/forum', forumRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] }
});

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';

io.of('/forum').use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('auth required'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) return next(new Error('user not found'));
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('invalid token'));
  }
});

io.of('/forum').on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`Socket connected: ${user.email}`);

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
      meta: meta || {}
    });
    io.of('/forum').to(roomId).emit('message', {
      id: msg._id,
      roomId: msg.roomId,
      authorId: msg.authorId,
      authorName: msg.authorName,
      text: msg.text,
      createdAt: msg.createdAt
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${user.email}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
