// Enhanced attendance route with real-time updates
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateAttendance } = require('../middleware/validation');

// Real-time attendance marking with Socket.IO integration
router.post('/', validateAttendance, async (req, res) => {
  try {
    const { student_id, date, status, marked_by, remarks } = req.body;

    // Check if student exists
    const [students] = await db.execute(
      'SELECT id, name, email, student_id as student_code FROM students WHERE id = ? AND status = "active"',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found or inactive'
      });
    }

    // Insert/Update attendance with real-time timestamp
    const [result] = await db.execute(
      `INSERT INTO attendance (student_id, date, status, marked_by, remarks) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       status = VALUES(status), 
       marked_by = VALUES(marked_by), 
       remarks = VALUES(remarks),
       updated_at = CURRENT_TIMESTAMP`,
      [student_id, date, status, marked_by || null, remarks || null]
    );

    // Get the complete attendance record
    const [newAttendance] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code, s.class, s.section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.student_id = ? AND a.date = ?
    `, [student_id, date]);

    const attendanceData = newAttendance[0];

    // 🚀 REAL-TIME BROADCAST
    if (req.io) {
      // Broadcast to all connected clients
      req.io.emit('attendance-marked', {
        type: 'ATTENDANCE_MARKED',
        data: attendanceData,
        timestamp: new Date().toISOString()
      });

      // Send to teacher/admin dashboard
      req.io.to('teacher').to('admin').emit('dashboard-update', {
        type: 'ATTENDANCE_UPDATE',
        student: students[0],
        attendance: attendanceData
      });

      // Get and broadcast updated statistics
      const [todayStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_marked,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
        FROM attendance WHERE date = ?
      `, [date]);

      req.io.emit('live-stats-update', {
        date,
        stats: todayStats[0],
        last_updated: new Date().toISOString()
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: { 
        attendance: attendanceData,
        real_time: true,
        broadcast_sent: !!req.io
      }
    });

  } catch (error) {
    console.error('Real-time attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
});

// Real-time attendance stream endpoint
router.get('/live-stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial data
  const today = new Date().toISOString().split('T')[0];
  const [todayAttendance] = await db.execute(`
    SELECT a.*, s.name, s.student_id as student_code
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.date = ?
    ORDER BY a.created_at DESC
    LIMIT 10
  `, [today]);

  res.write(`data: ${JSON.stringify({
    type: 'INITIAL_DATA',
    data: todayAttendance,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'HEARTBEAT',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

module.exports = router;