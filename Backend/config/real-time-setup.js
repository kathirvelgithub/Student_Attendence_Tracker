// Add real-time middleware to server.js
const RealTimeService = require('./services/RealTimeService');

// After creating server
const realTimeService = new RealTimeService(server);

// Middleware to pass Socket.IO to routes
app.use((req, res, next) => {
  req.io = realTimeService.io;
  req.realTimeService = realTimeService;
  next();
});

// Real-time attendance updates
app.use('/api/v1/real-time-attendance', require('./routes/real-time-attendance'));

// Real-time dashboard endpoint
app.get('/api/v1/live-dashboard', async (req, res) => {
  try {
    const stats = await realTimeService.getLiveStatistics();
    
    // Also broadcast to connected clients
    realTimeService.broadcastLiveStats(stats);
    
    res.json({
      status: 'success',
      data: stats,
      real_time: true
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get live dashboard data'
    });
  }
});

// WebSocket events for testing
realTimeService.io.on('connection', (socket) => {
  console.log('🔗 Client connected for real-time updates');
  
  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to Student Attendance Real-time System',
    timestamp: new Date().toISOString()
  });
  
  // Example: Student joins class room
  socket.on('join-class', (classData) => {
    socket.join(`class-${classData.class}-${classData.section}`);
    socket.emit('joined-class', {
      message: `Joined ${classData.class} ${classData.section}`,
      room: `class-${classData.class}-${classData.section}`
    });
  });
});

module.exports = { app, server, realTimeService };