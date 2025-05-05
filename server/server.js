const express = require('express');
const dotenv = require('dotenv');
const http = require('http'); // ✅ Add this
const cors = require("cors");
const path = require('path');

const { Server } = require('socket.io');
const { syncDatabase } = require('./Config/db');
const { sequelize } = require('./Config/db');
const memoryManager = require('./Utils/memoryManager');

// Start memory monitoring
const MEMORY_MONITOR_INTERVAL = 30000; // 30 seconds
const memoryMonitoringInterval = memoryManager.setupMemoryMonitoring(MEMORY_MONITOR_INTERVAL);

// Route imports...
const authRoutes = require('./Routes/UserRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const bookRoutes = require('./Routes/BookRoutes');
const easyCourseRoutes = require('./Routes/EasyCourseRoutes');
const generationRoutes = require('./Routes/GenerationRoutes');
const sharingRoutes = require('./Routes/SharingRoutes');
const answerCheckRoutes = require('./Routes/AnswerCheckRoutes');
const onboardingRoutes = require('./Routes/OnboardingRoutes');
const audioRoutes = require('./Routes/AudioRoutes'); 
const userDataRoutes = require('./Routes/UserDataRoutes');
const uploadRoutes = require('./Routes/UploadRoutes');

dotenv.config();

// Create Express app
const app = express();

// Display server startup information
console.log('Starting Mini Lessons Academy Server...');
console.log(`Node.js Version: ${process.version}`);
console.log(`Process ID: ${process.pid}`);
memoryManager.logMemoryUsage();

// Configure middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors({
    origin: ["http://localhost:5173", "https://app.minilessonsacademy.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Initialize database
syncDatabase();

// ✅ Create HTTP server and pass it to Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://app.minilessonsacademy.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Add memory optimization settings
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  connectTimeout: 15000,
  // Reduce buffer size from 100MB to 10MB to save memory
  maxHttpBufferSize: 1e7, // 10MB
  // Memory optimization settings
  perMessageDeflate: {
    threshold: 1024, // Only compress messages larger than this size
    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // 8KB
      memLevel: 4, // Lower memory usage (1-9, 9 is highest)
      level: 6 // Compression level (0-9, 0 no compression, 9 highest)
    }
  }
});

// Socket.IO connection management
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id.substring(0, 6)}...`);
  
  // Track connected sockets count
  const connectedSockets = io.sockets.sockets.size;
  console.log(`Active socket connections: ${connectedSockets}`);
  
  // Set per-socket memory limits
  socket.conn.maxHttpBufferSize = 1e6; // 1MB max buffer size
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id.substring(0, 6)}... disconnected: ${reason}`);
    // Suggest garbage collection after client disconnects
    if (global.gc && Math.random() < 0.2) { // Only 20% of disconnections to avoid too frequent GC
      global.gc();
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id.substring(0, 6)}... error:`, error);
  });
});

// Make io accessible in routes (if needed)
app.set('io', io);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/auth for authentication endpoints.');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const memory = memoryManager.getMemoryUsage(true);
  const uptime = process.uptime();
  
  // Format uptime
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const formattedUptime = 
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
  
  res.json({
    status: 'OK',
    uptime: formattedUptime,
    memory,
    connections: io.sockets.sockets.size
  });
});

// Mount routes
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);
app.use('/api', generationRoutes);
app.use('/api/shared', sharingRoutes);
app.use('/api', answerCheckRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/onboard', onboardingRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/files', uploadRoutes);

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Log initial memory usage
  memoryManager.logMemoryUsage();
  
  // If garbage collection is available, run it after startup
  if (global.gc) {
    setTimeout(() => {
      memoryManager.runGC();
    }, 5000);
  }
});

// Handle process shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  clearInterval(memoryMonitoringInterval);
  server.close(() => {
    console.log('Server closed');
    // Close database connection
    sequelize.close().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  memoryManager.logMemoryUsage();
  // Keep running but log the error
});
