# Backend Issues & Solutions Guide

## 🚨 Critical Errors Found

Your frontend is attempting to connect to backend endpoints, but several issues were detected:

### 1. **500 Internal Server Errors** (Most Critical)
**Endpoints affected:** `/api/v1/students`, `/api/v1/activities`

**Likely causes:**
- Database connection issues
- Missing database tables
- Database authentication problems
- Syntax errors in route handlers

**Solutions needed:**

#### A. Check Database Connection
```bash
# In your backend directory, check if MySQL is running
mysql -u your_username -p

# Test database connection
node -e "
const db = require('./config/database');
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
    connection.release();
  }
});
"
```

#### B. Ensure Database Schema Exists
```sql
-- Run this in your MySQL client
USE your_database_name;

-- Check if tables exist
SHOW TABLES;

-- If tables are missing, run your schema.sql file
SOURCE database/schema.sql;
```

#### C. Add Sample Data
```sql
-- Add some test students
INSERT INTO students (name, email, phone, student_id, class, section, status) VALUES
('John Doe', 'john.doe@example.com', '1234567890', 'STU001', '10th Grade', 'A', 'active'),
('Jane Smith', 'jane.smith@example.com', '1234567891', 'STU002', '10th Grade', 'A', 'active'),
('Mike Johnson', 'mike.johnson@example.com', '1234567892', 'STU003', '10th Grade', 'B', 'active');

-- Add some test activities
INSERT INTO activities (title, description, type, points, status, start_date, end_date) VALUES
('Math Quiz', 'Weekly math assessment', 'quiz', 10, 'active', '2024-01-15', '2024-01-15'),
('Science Fair', 'Annual science exhibition', 'event', 50, 'active', '2024-02-01', '2024-02-03');
```

### 2. **404 Not Found Errors**
**Endpoints affected:** `/api/v1/reports/attendance`, `/api/v1/rankings/attendance`

**Solutions needed:**

#### A. Add Missing Route Handlers

**For Reports (`routes/reports.js`):**
```javascript
// Add this route for attendance reports
router.get('/attendance', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Example query - adjust based on your database schema
    const attendanceData = await db.query(`
      SELECT 
        DATE(date) as date,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance 
      WHERE date BETWEEN ? AND ?
      GROUP BY DATE(date)
      ORDER BY date
    `, [start_date, end_date]);
    
    res.json({
      success: true,
      data: {
        dailyData: attendanceData,
        summary: {
          totalDays: attendanceData.length,
          averageAttendance: '92.5%'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message
    });
  }
});
```

**For Rankings (`routes/rankings.js`):**
```javascript
// Add this route for attendance rankings
router.get('/attendance', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Example query - adjust based on your database schema
    const rankings = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.student_id,
        s.class,
        s.section,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.status = 'active'
      GROUP BY s.id
      HAVING total_days > 0
      ORDER BY attendance_percentage DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({
      success: true,
      data: {
        rankings: rankings.map((student, index) => ({
          ...student,
          rank: index + 1
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching attendance rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance rankings',
      error: error.message
    });
  }
});
```

#### B. Verify Route Registration

**In your `server.js`, ensure all routes are registered:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Import route files
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const activitiesRoutes = require('./routes/activities');
const reportsRoutes = require('./routes/reports');
const rankingsRoutes = require('./routes/rankings');
const streaksRoutes = require('./routes/streaks');

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/reports', reportsRoutes);      // ← Make sure this exists
app.use('/api/v1/rankings', rankingsRoutes);    // ← Make sure this exists
app.use('/api/v1/streaks', streaksRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
```

### 3. **Debugging Steps**

#### A. Enable Backend Logging
Add this middleware to log all requests:
```javascript
// Add this before your routes in server.js
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.path}\`);
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  next();
});
```

#### B. Test Endpoints Manually
```bash
# Test if backend is running
curl http://localhost:3000/api/v1/students

# Test with verbose output to see full response
curl -v http://localhost:3000/api/v1/students

# Test database connection endpoint (add this to your backend)
curl http://localhost:3000/api/v1/health
```

#### C. Add Health Check Endpoint
```javascript
// Add this to your server.js
app.get('/api/v1/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    res.json({
      success: true,
      message: 'Backend is healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend is unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 🔧 Quick Fix Checklist

1. **✅ Verify MySQL is running** - `sudo systemctl status mysql` (Linux) or check MySQL Workbench
2. **✅ Check database exists** - Login to MySQL and verify your database exists
3. **✅ Run schema.sql** - Ensure all tables are created
4. **✅ Add sample data** - Insert test records to verify queries work
5. **✅ Check route files exist** - Verify all route files are in `/routes/` directory
6. **✅ Verify route registration** - Ensure all routes are registered in `server.js`
7. **✅ Add error logging** - Add console.log statements to debug
8. **✅ Test endpoints manually** - Use curl or Postman to test endpoints directly

## 🎯 Expected API Response Format

Your endpoints should return data in this format:
```javascript
// Success response
{
  "success": true,
  "data": {
    "students": [...],
    // or "activities": [...],
    // or "rankings": [...],
    // etc.
  },
  "pagination": {  // for paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📞 Next Steps

1. **Fix the database connection issues first** (500 errors)
2. **Add the missing route handlers** (404 errors)
3. **Test each endpoint manually** before testing with frontend
4. **Check backend console logs** for detailed error messages

The frontend has been updated with better error handling and will provide helpful messages when backend endpoints are missing or failing.