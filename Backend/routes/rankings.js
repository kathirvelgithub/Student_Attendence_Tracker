const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Internal handler to compute attendance rankings (shared by multiple routes)
const getAttendanceRankings = async (req, res) => {
  try {
    const { limit = 10, class: studentClass, section } = req.query;
    
    let classFilter = '';
    let params = [];
    
    if (studentClass) {
      classFilter += ' AND s.class = ?';
      params.push(studentClass);
    }
    
    if (section) {
      classFilter += ' AND s.section = ?';
      params.push(section);
    }
    
    params.push(parseInt(limit));
    
    const [rankings] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.student_id as student_code,
        s.class,
        s.section,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        ROUND(AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100, 2) as attendance_percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.status = 'active' ${classFilter}
      GROUP BY s.id, s.name, s.student_id, s.class, s.section
      HAVING total_days > 0
      ORDER BY attendance_percentage DESC, present_days DESC
      LIMIT ${parseInt(limit)}
    `, params.slice(0, -1)); // Remove the limit parameter since we're using string interpolation

    // Add rank position in JavaScript
    const rankingsWithPosition = rankings.map((ranking, index) => ({
      rank_position: index + 1,
      ...ranking
    }));

    res.status(200).json({
      status: 'success',
      data: {
        rankings: rankingsWithPosition,
        filters: {
          class: studentClass || 'All',
          section: section || 'All',
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance rankings',
      error: error.message
    });
  }
};

// Get student rankings by attendance (original endpoint)
router.get('/attendance-rankings', getAttendanceRankings);

// Compatibility alias expected by some frontends: /rankings/attendance
router.get('/attendance', getAttendanceRankings);

// Get activity leaderboard
router.get('/activity-leaderboard', async (req, res) => {
  try {
    const { limit = 10, activity_type } = req.query;
    
    let typeFilter = '';
    let params = [];
    
    if (activity_type) {
      typeFilter = ' AND ac.activity_type = ?';
      params.push(activity_type);
    }
    
    params.push(parseInt(limit));
    
    const [leaderboard] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.student_id as student_code,
        s.class,
        s.section,
        COUNT(ac.id) as total_activities,
        SUM(ac.points) as total_points,
        AVG(ac.points) as average_points,
        ROW_NUMBER() OVER (ORDER BY SUM(ac.points) DESC, COUNT(ac.id) DESC) as rank_position
      FROM students s
      LEFT JOIN activities ac ON s.id = ac.student_id
      WHERE s.status = 'active' ${typeFilter}
      GROUP BY s.id, s.name, s.student_id, s.class, s.section
      HAVING total_activities > 0
      ORDER BY total_points DESC, total_activities DESC
      LIMIT ${parseInt(limit)}
    `, params.slice(0, -1)); // Remove the limit parameter since we're using string interpolation

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard,
        filters: {
          activity_type: activity_type || 'All',
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activity leaderboard',
      error: error.message
    });
  }
});

// Get student achievements/badges
router.get('/achievements/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Get attendance achievements
    const [attendanceStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        ROUND(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100, 2) as attendance_rate
      FROM attendance 
      WHERE student_id = ?
    `, [student_id]);

    // Get activity achievements
    const [activityStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(points) as total_points,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as activities_won
      FROM activities 
      WHERE student_id = ?
    `, [student_id]);

    const stats = attendanceStats[0];
    const activities = activityStats[0];
    
    // Calculate achievements
    const achievements = [];
    
    // Attendance badges
    if (stats.attendance_rate >= 95) {
      achievements.push({
        type: 'attendance',
        badge: 'Perfect Attendee',
        description: '95%+ attendance rate',
        icon: '🏆',
        level: 'gold'
      });
    } else if (stats.attendance_rate >= 85) {
      achievements.push({
        type: 'attendance',
        badge: 'Regular Attendee',
        description: '85%+ attendance rate',
        icon: '🥈',
        level: 'silver'
      });
    }

    // Activity badges
    if (activities.total_points >= 100) {
      achievements.push({
        type: 'activity',
        badge: 'Activity Champion',
        description: '100+ activity points',
        icon: '🌟',
        level: 'gold'
      });
    }

    if (activities.activities_won >= 3) {
      achievements.push({
        type: 'activity',
        badge: 'Winner',
        description: '3+ competition wins',
        icon: '👑',
        level: 'gold'
      });
    }

    // Participation badge
    if (activities.total_activities >= 10) {
      achievements.push({
        type: 'participation',
        badge: 'Active Participant',
        description: '10+ activities',
        icon: '🎯',
        level: 'bronze'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        student_id: parseInt(student_id),
        achievements,
        stats: {
          attendance: stats,
          activities: activities
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
});

module.exports = router;