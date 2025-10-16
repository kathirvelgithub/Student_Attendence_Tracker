// Real-time Socket.IO implementation
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class RealTimeService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.setupSocketAuth();
    this.setupEventHandlers();
  }

  // Socket authentication middleware
  setupSocketAuth() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.id;
          socket.userRole = decoded.role;
        }
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  // Real-time event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📡 User connected: ${socket.id}`);
      
      // Join user to their role-based room
      if (socket.userRole) {
        socket.join(socket.userRole); // 'admin', 'teacher', 'student'
        console.log(`👤 User joined ${socket.userRole} room`);
      }

      // Real-time attendance marking
      socket.on('mark-attendance', async (data) => {
        try {
          const { student_id, date, status, marked_by } = data;
          
          // Save to database (your existing logic)
          // ... attendance saving code ...
          
          // Broadcast to all connected users
          this.io.emit('attendance-updated', {
            student_id,
            date,
            status,
            marked_by,
            timestamp: new Date().toISOString()
          });
          
          // Send to teacher/admin room only
          this.io.to('teacher').to('admin').emit('attendance-marked', {
            message: `Attendance marked for student ${student_id}`,
            data: { student_id, status, date }
          });
          
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark attendance' });
        }
      });

      // Real-time dashboard updates
      socket.on('get-live-stats', async () => {
        try {
          const stats = await this.getLiveStatistics();
          socket.emit('live-stats', stats);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get live stats' });
        }
      });

      // Real-time notifications
      socket.on('subscribe-notifications', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`🔔 User ${userId} subscribed to notifications`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`📡 User disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast attendance update to all clients
  broadcastAttendanceUpdate(attendanceData) {
    this.io.emit('attendance-update', {
      type: 'attendance_marked',
      data: attendanceData,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification', {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast live statistics
  broadcastLiveStats(stats) {
    this.io.emit('live-dashboard-update', stats);
  }

  // Get live statistics
  async getLiveStatistics() {
    const db = require('../config/database');
    
    // Get today's statistics
    const today = new Date().toISOString().split('T')[0];
    
    const [todayStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT student_id) as students_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
      FROM attendance 
      WHERE date = ?
    `, [today]);

    // Get total active students
    const [totalStudents] = await db.execute(`
      SELECT COUNT(*) as total FROM students WHERE status = 'active'
    `);

    return {
      today: todayStats[0],
      total_students: totalStudents[0].total,
      last_updated: new Date().toISOString()
    };
  }
}

module.exports = RealTimeService;