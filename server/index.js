const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GameState, GRID_SIZE, COOLDOWN_MS } = require('./gameState');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const gameState = new GameState();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/stats', (req, res) => {
  res.json(gameState.getStats());
});

app.get('/api/grid', (req, res) => {
  res.json({
    gridSize: GRID_SIZE,
    grid: gameState.getGridState(),
  });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(gameState.getLeaderboard());
});

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  const user = gameState.addUser(socket.id);
  console.log(`👤 ${user.name} (${user.color}) joined`);

  socket.emit('init', {
    user,
    gridSize: GRID_SIZE,
    cooldown: COOLDOWN_MS,
    grid: gameState.getGridState(),
    leaderboard: gameState.getLeaderboard(),
    stats: gameState.getStats(),
  });

  io.emit('user:joined', {
    user: { id: user.id, name: user.name, color: user.color },
    onlineCount: gameState.getStats().onlineUsers,
  });

  socket.on('claim', ({ row, col }) => {
    const result = gameState.claimBlock(socket.id, row, col);

    if (result.success) {
      io.emit('block:claimed', {
        cell: result.cell,
        user: result.user,
        leaderboard: gameState.getLeaderboard(),
        stats: gameState.getStats(),
      });
    } else {
      socket.emit('claim:failed', {
        reason: result.reason,
        remaining: result.remaining || 0,
      });
    }
  });

  socket.on('disconnect', () => {
    const user = gameState.removeUser(socket.id);
    if (user) {
      console.log(`👋 ${user.name} left`);
      io.emit('user:left', {
        userId: socket.id,
        userName: user.name,
        onlineCount: gameState.getStats().onlineUsers,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🟢 GridWars server running on http://localhost:${PORT}`);
  console.log(`📐 Grid: ${GRID_SIZE}x${GRID_SIZE} (${GRID_SIZE * GRID_SIZE} cells)`);
  console.log(`⏱  Cooldown: ${COOLDOWN_MS}ms\n`);
});
