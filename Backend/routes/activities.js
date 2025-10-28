const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateActivity, validateId, validateDateRange } = require('../middleware/validation');

// Get all activities with filters
router.get('/', validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { start_date, end_date, student_id, activity_type, status } = req.query;

    let query = `
      SELECT a.*, s.name, s.email, s.student_id as student_code, s.class, s.section
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    let queryParams = [];
    let countParams = [];

    if (start_date) {
      query += ' AND a.date >= ?';
      countQuery += ' AND a.date >= ?';
      queryParams.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      query += ' AND a.date <= ?';
      countQuery += ' AND a.date <= ?';
      queryParams.push(end_date);
      countParams.push(end_date);
    }

    if (student_id) {
      query += ' AND a.student_id = ?';
      countQuery += ' AND a.student_id = ?';
      queryParams.push(student_id);
      countParams.push(student_id);
    }

    if (activity_type) {
      query += ' AND a.activity_type = ?';
      countQuery += ' AND a.activity_type = ?';
      queryParams.push(activity_type);
      countParams.push(activity_type);
    }

    if (status) {
      query += ' AND a.status = ?';
      countQuery += ' AND a.status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY a.date DESC, a.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    // queryParams.push(limit, offset); // Remove these parameters

    const [activities] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          records_per_page: limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get activity by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const [activities] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code, s.class, s.section
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (activities.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { activity: activities[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

// Create new activity
router.post('/', validateActivity, async (req, res) => {
  try {
    const {
      student_id,
      title,
      activity_type,
      description,
      date,
      points,
      status
    } = req.body;

    // Check if student exists
    const [students] = await db.execute(
      'SELECT id FROM students WHERE id = ? AND status = "active"',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found or inactive'
      });
    }

    const [result] = await db.execute(
      `INSERT INTO activities (student_id, title, activity_type, description, date, points, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        title,
        activity_type,
        description || null,
        date,
        points || 0,
        status || 'pending'
      ]
    );

    const [newActivity] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json({
      status: 'success',
      message: 'Activity created successfully',
      data: { activity: newActivity[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create activity',
      error: error.message
    });
  }
});

// Update activity
router.put('/:id', validateId, validateActivity, async (req, res) => {
  try {
    const {
      student_id,
      title,
      activity_type,
      description,
      date,
      points,
      status
    } = req.body;

    const [result] = await db.execute(
      `UPDATE activities 
       SET student_id = ?, title = ?, activity_type = ?, description = ?, 
           date = ?, points = ?, status = ?
       WHERE id = ?`,
      [
        student_id,
        title,
        activity_type,
        description || null,
        date,
        points || 0,
        status || 'pending',
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    const [updatedActivity] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    res.status(200).json({
      status: 'success',
      message: 'Activity updated successfully',
      data: { activity: updatedActivity[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update activity',
      error: error.message
    });
  }
});

// Delete activity
router.delete('/:id', validateId, async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM activities WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// Get activity statistics
router.get('/statistics/overview', validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date BETWEEN ? AND ?';
      params = [start_date, end_date];
    } else if (start_date) {
      dateFilter = 'WHERE date >= ?';
      params = [start_date];
    } else if (end_date) {
      dateFilter = 'WHERE date <= ?';
      params = [end_date];
    }

    // Overall statistics
    const [overallStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT student_id) as participating_students,
        SUM(points) as total_points_awarded,
        AVG(points) as average_points_per_activity
      FROM activities 
      ${dateFilter}
    `, params);

    // Activities by type
    const [typeStats] = await db.execute(`
      SELECT 
        activity_type,
        COUNT(*) as activity_count,
        SUM(points) as total_points,
        AVG(points) as average_points
      FROM activities 
      ${dateFilter}
      GROUP BY activity_type
      ORDER BY activity_count DESC
    `, params);

    // Activities by status
    const [statusStats] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(points) as total_points
      FROM activities 
      ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `, params);

    // Top performing students
    const [topStudents] = await db.execute(`
      SELECT 
        s.name,
        s.student_id as student_code,
        COUNT(a.id) as activity_count,
        SUM(a.points) as total_points
      FROM activities a
      JOIN students s ON a.student_id = s.id
      ${dateFilter}
      GROUP BY s.id, s.name, s.student_id
      ORDER BY total_points DESC, activity_count DESC
      LIMIT 10
    `, params);

    // Recent activities
    const [recentActivities] = await db.execute(`
      SELECT 
        a.title,
        a.activity_type,
        a.date,
        a.points,
        a.status,
        s.name as student_name,
        s.student_id as student_code
      FROM activities a
      JOIN students s ON a.student_id = s.id
      ${dateFilter}
      ORDER BY a.date DESC, a.created_at DESC
      LIMIT 10
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        overall_statistics: overallStats[0],
        activity_by_type: typeStats,
        activity_by_status: statusStats,
        top_students: topStudents,
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
});

// Get activities by student
router.get('/student/:student_id', validateId, validateDateRange, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let params = [student_id];
    
    if (start_date && end_date) {
      dateFilter = 'AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = 'AND date >= ?';
      params.push(start_date);
    } else if (end_date) {
      dateFilter = 'AND date <= ?';
      params.push(end_date);
    }

    const [activities] = await db.execute(`
      SELECT * FROM activities 
      WHERE student_id = ? ${dateFilter}
      ORDER BY date DESC
    `, params);

    const [summary] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(points) as total_points,
        activity_type,
        COUNT(*) as type_count
      FROM activities 
      WHERE student_id = ? ${dateFilter}
      GROUP BY activity_type
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student activities',
      error: error.message
    });
  }
});

module.exports = router;