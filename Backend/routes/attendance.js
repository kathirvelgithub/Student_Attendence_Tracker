const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateAttendance, validateId, validateDateRange } = require('../middleware/validation');

// Get attendance records with filters
router.get('/', validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { start_date, end_date, student_id, status } = req.query;

    let query = `
      SELECT a.*, s.name, s.email, s.student_id as student_code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM attendance a
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

    if (status) {
      query += ' AND a.status = ?';
      countQuery += ' AND a.status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY a.date DESC, s.name ASC LIMIT ${limit} OFFSET ${offset}`;
    // queryParams.push(limit, offset); // Remove these parameters

    const [attendance] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
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
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const [attendance] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code, s.class, s.section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ?
      ORDER BY s.name ASC
    `, [date]);

    // Get summary for the date
    const [summary] = await db.execute(`
      SELECT 
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
      FROM attendance 
      WHERE date = ?
    `, [date]);

    res.status(200).json({
      status: 'success',
      data: {
        date,
        attendance,
        summary: summary[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance for date',
      error: error.message
    });
  }
});

// Mark attendance
router.post('/', validateAttendance, async (req, res) => {
  try {
    const { student_id, date, status, marked_by, remarks } = req.body;

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
      `INSERT INTO attendance (student_id, date, status, marked_by, remarks) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       status = VALUES(status), 
       marked_by = VALUES(marked_by), 
       remarks = VALUES(remarks),
       updated_at = CURRENT_TIMESTAMP`,
      [student_id, date, status, marked_by || null, remarks || null]
    );

    const [newAttendance] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.student_id = ? AND a.date = ?
    `, [student_id, date]);

    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: { attendance: newAttendance[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
});

// Mark attendance for multiple students
router.post('/bulk', async (req, res) => {
  try {
    const { date, attendance_records, marked_by } = req.body;

    if (!Array.isArray(attendance_records) || attendance_records.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance records array is required'
      });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const results = [];
      
      for (const record of attendance_records) {
        const { student_id, status, remarks } = record;
        
        await connection.execute(
          `INSERT INTO attendance (student_id, date, status, marked_by, remarks) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           status = VALUES(status), 
           marked_by = VALUES(marked_by), 
           remarks = VALUES(remarks),
           updated_at = CURRENT_TIMESTAMP`,
          [student_id, date, status, marked_by || null, remarks || null]
        );

        results.push({ student_id, status: 'success' });
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        status: 'success',
        message: 'Bulk attendance marked successfully',
        data: { 
          date,
          processed_records: results.length,
          results 
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark bulk attendance',
      error: error.message
    });
  }
});

// Update attendance
router.put('/:id', validateId, validateAttendance, async (req, res) => {
  try {
    const { student_id, date, status, marked_by, remarks } = req.body;

    const [result] = await db.execute(
      `UPDATE attendance 
       SET student_id = ?, date = ?, status = ?, marked_by = ?, remarks = ?
       WHERE id = ?`,
      [student_id, date, status, marked_by || null, remarks || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    const [updatedAttendance] = await db.execute(`
      SELECT a.*, s.name, s.email, s.student_id as student_code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    res.status(200).json({
      status: 'success',
      message: 'Attendance updated successfully',
      data: { attendance: updatedAttendance[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update attendance',
      error: error.message
    });
  }
});

// Delete attendance record
router.delete('/:id', validateId, async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM attendance WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
});

// Get attendance statistics
router.get('/statistics', validateDateRange, async (req, res) => {
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

    const [overallStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT date) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
        ROUND(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100, 2) as average_attendance_rate
      FROM attendance 
      ${dateFilter}
    `, params);

    const [dailyStats] = await db.execute(`
      SELECT 
        date,
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM attendance 
      ${dateFilter}
      GROUP BY date 
      ORDER BY date DESC
      LIMIT 30
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        overall_statistics: overallStats[0],
        daily_statistics: dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
});

module.exports = router;