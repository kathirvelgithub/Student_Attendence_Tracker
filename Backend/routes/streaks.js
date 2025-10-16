const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get attendance streak for a student
router.get('/streak/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Get current attendance streak (simplified version)
    const [recentAttendance] = await db.execute(`
      SELECT date, status
      FROM attendance 
      WHERE student_id = ? 
      ORDER BY date DESC 
      LIMIT 30
    `, [student_id]);

    // Calculate current streak in JavaScript
    let currentStreak = 0;
    for (const record of recentAttendance) {
      if (record.status === 'present') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get total present days for longest possible streak calculation
    const [totalStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
      FROM attendance
      WHERE student_id = ?
    `, [student_id]);

    res.json({
      status: 'success',
      data: {
        current_streak: currentStreak,
        total_present_days: totalStats[0]?.present_days || 0,
        total_days: totalStats[0]?.total_days || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get attendance streak',
      error: error.message
    });
  }
});

module.exports = router;