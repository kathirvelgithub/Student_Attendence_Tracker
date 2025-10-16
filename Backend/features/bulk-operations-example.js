// routes/bulk.js - Bulk operations
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Bulk student import from CSV
router.post('/students/import', async (req, res) => {
  try {
    const { students } = req.body; // Array of student objects
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const student of students) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO students (name, email, phone, student_id, class, section) VALUES (?, ?, ?, ?, ?, ?)',
          [student.name, student.email, student.phone, student.student_id, student.class, student.section]
        );
        results.push({ student_id: student.student_id, status: 'success', id: result.insertId });
      } catch (error) {
        results.push({ student_id: student.student_id, status: 'failed', error: error.message });
      }
    }
    
    await connection.commit();
    connection.release();
    
    res.json({
      status: 'success',
      message: `Processed ${students.length} students`,
      results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Bulk import failed',
      error: error.message
    });
  }
});

module.exports = router;