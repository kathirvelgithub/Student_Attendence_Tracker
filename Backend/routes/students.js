const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/v1/students - List students with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      class: studentClass, 
      section, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build dynamic query
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    
    // Search functionality
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Filter by class
    if (studentClass) {
      query += ' AND class = ?';
      params.push(studentClass);
    }
    
    // Filter by section
    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    
    // Filter by status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // Add sorting and pagination
    query += ` ORDER BY name ASC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    // Execute query
    const [students] = await db.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (studentClass) {
      countQuery += ' AND class = ?';
      countParams.push(studentClass);
    }
    if (section) {
      countQuery += ' AND section = ?';
      countParams.push(section);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// POST /api/v1/students - Create new student
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      student_id,
      class: studentClass,
      section,
      status = 'active',
      date_of_birth,
      address,
      parent_name,
      parent_phone,
      parent_email
    } = req.body;
    
    // Validation
    if (!name || !student_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'student_id', message: 'Student ID is required' }
        ]
      });
    }
    
    // Check for duplicate email
    if (email) {
      const [existingEmail] = await db.execute('SELECT id FROM students WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'email', message: 'Email already exists' }]
        });
      }
    }
    
    // Check for duplicate student_id
    const [existingStudentId] = await db.execute('SELECT id FROM students WHERE student_id = ?', [student_id]);
    if (existingStudentId.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'student_id', message: 'Student ID already exists' }]
      });
    }
    
    // Insert new student
    const [result] = await db.execute(
      `INSERT INTO students (
        name, email, phone, student_id, class, section, status,
        date_of_birth, address, parent_name, parent_phone, parent_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, phone, student_id, studentClass, section, status,
        date_of_birth, address, parent_name, parent_phone, parent_email
      ]
    );
    
    // Get the created student
    const [newStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      success: true,
      data: {
        student: newStudent[0]
      },
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
});

// GET /api/v1/students/:id - Get single student
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [student] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    
    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        student: student[0]
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    });
  }
});

// PUT /api/v1/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if student exists
    const [existingStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    if (existingStudent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check for duplicate email (if email is being updated)
    if (updates.email) {
      const [existingEmail] = await db.execute(
        'SELECT id FROM students WHERE email = ? AND id != ?', 
        [updates.email, id]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'email', message: 'Email already exists' }]
        });
      }
    }
    
    // Check for duplicate student_id (if student_id is being updated)
    if (updates.student_id) {
      const [existingStudentId] = await db.execute(
        'SELECT id FROM students WHERE student_id = ? AND id != ?', 
        [updates.student_id, id]
      );
      if (existingStudentId.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'student_id', message: 'Student ID already exists' }]
        });
      }
    }
    
    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    // Update student
    await db.execute(
      `UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    // Get updated student
    const [updatedStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: {
        student: updatedStudent[0]
      },
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
});

// DELETE /api/v1/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const [existingStudent] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    if (existingStudent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Delete student
    await db.execute('DELETE FROM students WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
});

module.exports = router;

// Get all students with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'active';

    let query = `
      SELECT id, name, email, phone, student_id, class, section, status, 
             date_of_birth, address, parent_name, parent_phone, parent_email,
             created_at, updated_at
      FROM students 
      WHERE status = ?
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM students WHERE status = ?';
    let queryParams = [status];
    let countParams = [status];

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    // queryParams.push(limit, offset); // Remove these parameters

    const [students] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      status: 'success',
      data: {
        students,
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
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// Get student by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const [students] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { student: students[0] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student',
      error: error.message
    });
  }
});

// Create new student
router.post('/', validateStudent, async (req, res) => {
  try {
    const { 
      name, email, phone, student_id, class: studentClass, section,
      date_of_birth, address, parent_name, parent_phone, parent_email 
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO students (name, email, phone, student_id, class, section, 
                            date_of_birth, address, parent_name, parent_phone, parent_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        email || null, 
        phone || null, 
        student_id, 
        studentClass || null, 
        section || null,
        date_of_birth || null,
        address || null,
        parent_name || null,
        parent_phone || null,
        parent_email || null
      ]
    );

    const [newStudent] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: { student: newStudent[0] }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Student with this email or student ID already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create student',
      error: error.message
    });
  }
});

// Update student
router.put('/:id', validateId, validateStudent, async (req, res) => {
  try {
    const { 
      name, email, phone, student_id, class: studentClass, section,
      date_of_birth, address, parent_name, parent_phone, parent_email 
    } = req.body;

    const [result] = await db.execute(
      `UPDATE students 
       SET name = ?, email = ?, phone = ?, student_id = ?, class = ?, section = ?,
           date_of_birth = ?, address = ?, parent_name = ?, parent_phone = ?, parent_email = ?
       WHERE id = ?`,
      [
        name, 
        email || null, 
        phone || null, 
        student_id, 
        studentClass || null, 
        section || null,
        date_of_birth || null,
        address || null,
        parent_name || null,
        parent_phone || null,
        parent_email || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const [updatedStudent] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: { student: updatedStudent[0] }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Student with this email or student ID already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update student',
      error: error.message
    });
  }
});

// Delete student (soft delete)
router.delete('/:id', validateId, async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE students SET status = "inactive" WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete student',
      error: error.message
    });
  }
});

// Get student's attendance summary
router.get('/:id/attendance-summary', validateId, async (req, res) => {
  try {
    const [attendanceData] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM attendance 
      WHERE student_id = ?
    `, [req.params.id]);

    const [recentAttendance] = await db.execute(`
      SELECT date, status, remarks 
      FROM attendance 
      WHERE student_id = ? 
      ORDER BY date DESC 
      LIMIT 10
    `, [req.params.id]);

    res.status(200).json({
      status: 'success',
      data: {
        summary: attendanceData[0],
        recent_attendance: recentAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
});

// Get student's activities
router.get('/:id/activities', validateId, async (req, res) => {
  try {
    const [activities] = await db.execute(`
      SELECT * FROM activities 
      WHERE student_id = ? 
      ORDER BY activity_date DESC
    `, [req.params.id]);

    const [summary] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(points) as total_points,
        activity_type,
        COUNT(*) as count
      FROM activities 
      WHERE student_id = ?
      GROUP BY activity_type
    `, [req.params.id]);

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        summary: summary
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