const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateDateRange } = require('../middleware/validation');

// Get comprehensive dashboard statistics
router.get('/dashboard', validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    let attendanceParams = [];
    let activityParams = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date BETWEEN ? AND ?';
      attendanceParams = [start_date, end_date];
      activityParams = [start_date, end_date];
    } else if (start_date) {
      dateFilter = 'WHERE date >= ?';
      attendanceParams = [start_date];
      activityParams = [start_date];
    } else if (end_date) {
      dateFilter = 'WHERE date <= ?';
      attendanceParams = [end_date];
      activityParams = [end_date];
    }

    // Student statistics
    const [studentStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_students
      FROM students
    `);

    // Attendance statistics
    const [attendanceStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_attendance_records,
        COUNT(DISTINCT student_id) as students_with_attendance,
        COUNT(DISTINCT date) as total_days_tracked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
        ROUND(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100, 2) as overall_attendance_rate
      FROM attendance 
      ${dateFilter.replace('date', 'date')}
    `, attendanceParams);

    // Activity statistics
    const [activityStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT student_id) as students_with_activities,
        SUM(points) as total_points_awarded,
        AVG(points) as average_points_per_activity
      FROM activities 
      ${dateFilter.replace('date', 'activity_date')}
    `, activityParams);

    // Recent attendance trends (last 7 days)
    const [attendanceTrends] = await db.execute(`
      SELECT 
        date,
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM attendance 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date 
      ORDER BY date DESC
    `);

    // Top performing students (by points)
    const [topStudents] = await db.execute(`
      SELECT 
        s.name,
        s.student_id as student_code,
        s.class,
        s.section,
        COUNT(a.id) as activity_count,
        COALESCE(SUM(a.points), 0) as total_points,
        COALESCE(attendance_summary.attendance_rate, 0) as attendance_rate
      FROM students s
      LEFT JOIN activities a ON s.id = a.student_id ${activityParams.length > 0 ? 'AND a.activity_date BETWEEN ? AND ?' : ''}
      LEFT JOIN (
        SELECT 
          student_id,
          ROUND(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100, 2) as attendance_rate
        FROM attendance
        ${attendanceParams.length > 0 ? 'WHERE date BETWEEN ? AND ?' : ''}
        GROUP BY student_id
      ) attendance_summary ON s.id = attendance_summary.student_id
      WHERE s.status = 'active'
      GROUP BY s.id, s.name, s.student_id, s.class, s.section, attendance_summary.attendance_rate
      ORDER BY total_points DESC, attendance_rate DESC
      LIMIT 10
    `, [...activityParams, ...attendanceParams]);

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          students: studentStats[0],
          attendance: attendanceStats[0],
          activities: activityStats[0]
        },
        attendance_trends: attendanceTrends,
        top_students: topStudents
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Compatibility endpoint: overall attendance report for a date range
// GET /api/v1/reports/attendance?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/attendance', validateDateRange, async (req, res) => {
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
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        overall_statistics: overallStats[0],
        daily_statistics: dailyStats,
        period: { start_date: start_date || null, end_date: end_date || null }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate attendance report',
      error: error.message
    });
  }
});

// Generate student attendance report
router.get('/attendance/:student_id', validateDateRange, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;

    // Student information
    const [studentInfo] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [student_id]
    );

    if (studentInfo.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

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

    // Attendance records
    const [attendanceRecords] = await db.execute(`
      SELECT * FROM attendance 
      WHERE student_id = ? ${dateFilter}
      ORDER BY date DESC
    `, params);

    // Attendance summary
    const [attendanceSummary] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM attendance 
      WHERE student_id = ? ${dateFilter}
    `, params);

    // Monthly breakdown
    const [monthlyBreakdown] = await db.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM attendance 
      WHERE student_id = ? ${dateFilter}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        student: studentInfo[0],
        summary: attendanceSummary[0],
        records: attendanceRecords,
        monthly_breakdown: monthlyBreakdown,
        report_period: {
          start_date: start_date || 'All time',
          end_date: end_date || 'Present',
          generated_at: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate attendance report',
      error: error.message
    });
  }
});

// Generate student activity report
router.get('/activities/:student_id', validateDateRange, async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;

    // Student information
    const [studentInfo] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [student_id]
    );

    if (studentInfo.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    let dateFilter = '';
    let params = [student_id];
    
    if (start_date && end_date) {
      dateFilter = 'AND activity_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = 'AND activity_date >= ?';
      params.push(start_date);
    } else if (end_date) {
      dateFilter = 'AND activity_date <= ?';
      params.push(end_date);
    }

    // Activity records
    const [activityRecords] = await db.execute(`
      SELECT * FROM activities 
      WHERE student_id = ? ${dateFilter}
      ORDER BY activity_date DESC
    `, params);

    // Activity summary
    const [activitySummary] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(points) as total_points,
        AVG(points) as average_points,
        activity_type,
        COUNT(*) as type_count,
        SUM(points) as type_points
      FROM activities 
      WHERE student_id = ? ${dateFilter}
      GROUP BY activity_type
    `, params);

    // Overall summary
    const [overallSummary] = await db.execute(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(points) as total_points,
        AVG(points) as average_points_per_activity,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as activities_won,
        SUM(CASE WHEN status = 'participated' THEN 1 ELSE 0 END) as activities_participated
      FROM activities 
      WHERE student_id = ? ${dateFilter}
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        student: studentInfo[0],
        overall_summary: overallSummary[0],
        type_breakdown: activitySummary,
        records: activityRecords,
        report_period: {
          start_date: start_date || 'All time',
          end_date: end_date || 'Present',
          generated_at: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate activity report',
      error: error.message
    });
  }
});

// Generate class/section-wise attendance report
router.get('/class-attendance', validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date, class: studentClass, section } = req.query;

    let dateFilter = '';
    let classFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND a.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = 'AND a.date >= ?';
      params.push(start_date);
    } else if (end_date) {
      dateFilter = 'AND a.date <= ?';
      params.push(end_date);
    }

    if (studentClass) {
      classFilter += ' AND s.class = ?';
      params.push(studentClass);
    }

    if (section) {
      classFilter += ' AND s.section = ?';
      params.push(section);
    }

    const [classAttendance] = await db.execute(`
      SELECT 
        s.class,
        s.section,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(a.id) as total_attendance_records,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as total_late,
        ROUND(AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100, 2) as attendance_rate
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.status = 'active' ${dateFilter} ${classFilter}
      GROUP BY s.class, s.section
      ORDER BY s.class, s.section
    `, params);

    res.status(200).json({
      status: 'success',
      data: {
        class_attendance: classAttendance,
        filters: {
          class: studentClass || 'All',
          section: section || 'All',
          start_date: start_date || 'All time',
          end_date: end_date || 'Present'
        },
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate class attendance report',
      error: error.message
    });
  }
});

// Export attendance data (CSV format)
router.get('/export/attendance', validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;

    let dateFilter = '';
    let params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE a.date BETWEEN ? AND ?';
      params = [start_date, end_date];
    } else if (start_date) {
      dateFilter = 'WHERE a.date >= ?';
      params = [start_date];
    } else if (end_date) {
      dateFilter = 'WHERE a.date <= ?';
      params = [end_date];
    }

    const [attendanceData] = await db.execute(`
      SELECT 
        s.name,
        s.email,
        s.student_id as student_code,
        s.class,
        s.section,
        a.date,
        a.status,
        a.marked_by,
        a.remarks,
        a.created_at
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      ${dateFilter}
      ORDER BY a.date DESC, s.name ASC
    `, params);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Name,Email,Student ID,Class,Section,Date,Status,Marked By,Remarks,Created At\n';
      const csvData = attendanceData.map(row => 
        `"${row.name}","${row.email}","${row.student_code}","${row.class || ''}","${row.section || ''}","${row.date}","${row.status}","${row.marked_by || ''}","${row.remarks || ''}","${row.created_at}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
      res.send(csvHeader + csvData);
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          attendance_data: attendanceData,
          total_records: attendanceData.length,
          export_period: {
            start_date: start_date || 'All time',
            end_date: end_date || 'Present',
            exported_at: new Date().toISOString()
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export attendance data',
      error: error.message
    });
  }
});

module.exports = router;