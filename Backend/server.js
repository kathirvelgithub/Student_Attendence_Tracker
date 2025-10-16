const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced logging function
const log = (level, message, error = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${error ? '\nError: ' + error.stack : ''}\n`;
  
  // Log to console
  console.log(logMessage);
  
  // Log to file
  const logFile = path.join(logsDir, 'backend.log');
  fs.appendFileSync(logFile, logMessage);
};

const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const activityRoutes = require('./routes/activities');
const reportRoutes = require('./routes/reports');
const streakRoutes = require('./routes/streaks');
const rankingRoutes = require('./routes/rankings');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  // Log all incoming requests
  log('info', `${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Error logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      log('error', `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Response: ${data}`);
    }
    originalSend.call(this, data);
  };
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/streaks', streakRoutes);
app.use('/api/v1/rankings', rankingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Attendance Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Student Activity & Attendance Tracker API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// DB health endpoint
app.get('/api/v1/db-health', async (req, res) => {
  try {
    log('info', 'Database health check requested');
    const [students] = await db.query('SELECT COUNT(*) as c FROM students');
    const [attendance] = await db.query('SELECT COUNT(*) as c FROM attendance');
    const [activities] = await db.query('SELECT COUNT(*) as c FROM activities');
    
    const healthData = {
      status: 'success',
      database: 'connected',
      tables: {
        students: students[0]?.c ?? 0,
        attendance: attendance[0]?.c ?? 0,
        activities: activities[0]?.c ?? 0
      },
      timestamp: new Date().toISOString()
    };
    
    log('info', 'Database health check successful', null);
    res.status(200).json(healthData);
  } catch (error) {
    log('error', 'Database health check failed', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  // Join user to general room
  socket.join('general');
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
  
  // Handle real-time attendance updates
  socket.on('attendance_marked', (data) => {
    io.to('general').emit('attendance_update', data);
  });
  
  // Handle real-time activity updates
  socket.on('activity_added', (data) => {
    io.to('general').emit('activity_update', data);
  });
});

// Start server
server.listen(PORT, () => {
  log('info', `🚀 Server running on port ${PORT}`);
  log('info', `📊 Student Attendance Tracker API v1.0.0`);
  log('info', `🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  log('info', `📋 Health check: http://localhost:${PORT}/api/health`);
  log('info', `🔌 Socket.IO enabled for real-time updates`);
});

module.exports = app;