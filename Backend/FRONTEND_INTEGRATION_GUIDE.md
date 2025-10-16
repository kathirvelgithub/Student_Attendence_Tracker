# 🚀 Student Attendance Tracker - Backend API Documentation for Frontend Development

## 📋 Project Overview

**Project Name**: Student Activity & Attendance Tracker API
**Technology Stack**: Node.js, Express.js, MySQL, Socket.IO
**Purpose**: Backend API for managing student records, tracking attendance, logging activities, and generating comprehensive reports
**Architecture**: RESTful API with real-time communication capabilities

---

## 🌐 API Base Configuration

### **Server Details:**
- **Base URL**: `http://localhost:3000`
- **API Version**: v1
- **API Base Path**: `/api/v1`
- **Health Check**: `GET /api/health`
- **Documentation**: This document

### **Authentication:**
- **Type**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 24 hours
- **Refresh Token**: 7 days

### **Response Format:**
```json
{
  "status": "success" | "error",
  "message": "Description of the operation",
  "data": {}, // Response data
  "pagination": {}, // For paginated responses
  "timestamp": "2025-10-06T10:30:15.000Z"
}
```

---

## 📊 Data Models & Schemas

### **1. Student Model:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@school.com",
  "phone": "1234567890",
  "student_id": "STU001",
  "class": "10th Grade",
  "section": "A",
  "status": "active" | "inactive",
  "created_at": "2025-10-06T09:00:00.000Z",
  "updated_at": "2025-10-06T09:00:00.000Z"
}
```

### **2. Attendance Model:**
```json
{
  "id": 1,
  "student_id": 1,
  "date": "2025-10-06",
  "status": "present" | "absent" | "late",
  "marked_by": "Teacher Smith",
  "remarks": "On time",
  "created_at": "2025-10-06T09:15:00.000Z",
  "updated_at": "2025-10-06T09:15:00.000Z",
  "student_name": "John Doe",
  "student_code": "STU001"
}
```

### **3. Activity Model:**
```json
{
  "id": 1,
  "student_id": 1,
  "activity_name": "Science Fair",
  "activity_type": "academic" | "sports" | "cultural" | "technical" | "other",
  "description": "Participated in school science fair",
  "activity_date": "2025-10-06",
  "points": 15,
  "status": "participated" | "won" | "completed" | "pending",
  "recorded_by": "Teacher Name",
  "created_at": "2025-10-06T10:00:00.000Z",
  "updated_at": "2025-10-06T10:00:00.000Z"
}
```

### **4. User Model (Authentication):**
```json
{
  "id": 1,
  "username": "teacher1",
  "email": "teacher@school.com",
  "role": "admin" | "teacher" | "staff",
  "full_name": "Teacher Name",
  "status": "active" | "inactive",
  "last_login": "2025-10-06T08:30:00.000Z"
}
```

---

## 🔌 Complete API Endpoints Reference

### **🏥 System & Health**
```
GET  /api/health                    - System health check
GET  /                              - API welcome message
```

### **🔐 Authentication (To be implemented)**
```
POST /api/v1/auth/login            - User login
POST /api/v1/auth/logout           - User logout
POST /api/v1/auth/refresh          - Refresh JWT token
GET  /api/v1/auth/profile          - Get user profile
PUT  /api/v1/auth/profile          - Update user profile
```

### **👨‍🎓 Students Management**
```
GET    /api/v1/students                           - List all students (paginated, searchable)
GET    /api/v1/students/:id                       - Get student by ID
POST   /api/v1/students                           - Create new student
PUT    /api/v1/students/:id                       - Update student
DELETE /api/v1/students/:id                       - Delete student (soft delete)
GET    /api/v1/students/:id/attendance-summary    - Student attendance overview
GET    /api/v1/students/:id/activities             - Student activities list
```

**Query Parameters for GET /students:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `search`: Search by name, email, or student_id
- `status`: Filter by status (active/inactive)
- `class`: Filter by class
- `section`: Filter by section

### **📅 Attendance Management**
```
GET    /api/v1/attendance                     - List attendance records (filtered)
GET    /api/v1/attendance/date/:date          - Attendance by specific date (YYYY-MM-DD)
POST   /api/v1/attendance                     - Mark single attendance
POST   /api/v1/attendance/bulk                - Mark bulk attendance
PUT    /api/v1/attendance/:id                 - Update attendance record
DELETE /api/v1/attendance/:id                 - Delete attendance record
GET    /api/v1/attendance/statistics          - Attendance analytics
```

**Query Parameters for GET /attendance:**
- `page`, `limit`: Pagination
- `start_date`, `end_date`: Date range filter (YYYY-MM-DD)
- `student_id`: Filter by student
- `status`: Filter by attendance status

### **🏃‍♂️ Activities Management**
```
GET    /api/v1/activities                         - List activities (filtered)
GET    /api/v1/activities/:id                     - Get activity by ID
POST   /api/v1/activities                         - Create new activity
PUT    /api/v1/activities/:id                     - Update activity
DELETE /api/v1/activities/:id                     - Delete activity
GET    /api/v1/activities/statistics/overview     - Activity statistics
GET    /api/v1/activities/student/:student_id     - Student-specific activities
```

**Query Parameters for GET /activities:**
- `page`, `limit`: Pagination
- `start_date`, `end_date`: Date range filter
- `student_id`: Filter by student
- `activity_type`: Filter by type
- `status`: Filter by status

### **📊 Reports & Analytics**
```
GET /api/v1/reports/dashboard                    - Main dashboard statistics
GET /api/v1/reports/attendance/:student_id      - Student attendance report
GET /api/v1/reports/activities/:student_id      - Student activity report
GET /api/v1/reports/class-attendance             - Class-wise attendance report
GET /api/v1/reports/export/attendance           - Export attendance data (JSON/CSV)
```

**Query Parameters for Reports:**
- `start_date`, `end_date`: Date range
- `format`: Export format (json/csv)
- `class`, `section`: Class filters

### **🏆 Gamification & Rankings**
```
GET /api/v1/rankings/attendance-rankings        - Top students by attendance
GET /api/v1/rankings/activity-leaderboard       - Activity leaderboard by points
GET /api/v1/rankings/achievements/:student_id   - Student achievements & badges
GET /api/v1/streaks/streak/:student_id          - Student attendance streaks
```

### **🔄 Real-time Features**
```
GET /api/v1/live-dashboard                       - Live dashboard statistics
GET /api/v1/attendance/live-stream              - Server-Sent Events for attendance
```

---

## 🚀 Real-time Communication (Socket.IO)

### **Connection Setup:**
```javascript
// Frontend Socket.IO connection
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token' // Optional authentication
  }
});
```

### **Real-time Events:**

#### **Client → Server Events:**
```javascript
// Join class room for updates
socket.emit('join-class', {
  class: '10th Grade',
  section: 'A'
});

// Mark attendance with real-time broadcast
socket.emit('mark-attendance', {
  student_id: 1,
  date: '2025-10-06',
  status: 'present',
  marked_by: 'Teacher Name'
});

// Get live statistics
socket.emit('get-live-stats');

// Subscribe to notifications
socket.emit('subscribe-notifications', userId);
```

#### **Server → Client Events:**
```javascript
// Attendance marked notification
socket.on('attendance-marked', (data) => {
  console.log('New attendance:', data);
  // Update UI with new attendance
});

// Live dashboard updates
socket.on('live-stats-update', (stats) => {
  console.log('Updated stats:', stats);
  // Update dashboard counters/charts
});

// Real-time notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Show notification to user
});

// Dashboard updates for teachers/admins
socket.on('dashboard-update', (update) => {
  console.log('Dashboard update:', update);
  // Update admin dashboard
});

// Welcome message on connection
socket.on('welcome', (message) => {
  console.log('Connected:', message);
});
```

---

## 📊 Sample API Responses

### **Dashboard Statistics Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "students": {
        "total_students": 50,
        "active_students": 48,
        "inactive_students": 2
      },
      "attendance": {
        "total_attendance_records": 1250,
        "students_with_attendance": 48,
        "total_days_tracked": 26,
        "overall_attendance_rate": 92.5
      },
      "activities": {
        "total_activities": 75,
        "students_with_activities": 45,
        "total_points_awarded": 1125,
        "average_points_per_activity": 15
      }
    },
    "attendance_trends": [
      {
        "date": "2025-10-06",
        "total_marked": 48,
        "present_count": 45,
        "absent_count": 2,
        "late_count": 1,
        "attendance_rate": 93.75
      }
    ],
    "top_students": [
      {
        "name": "John Doe",
        "student_code": "STU001",
        "class": "10th Grade",
        "section": "A",
        "total_points": 95,
        "attendance_rate": 98.5
      }
    ]
  }
}
```

### **Student List Response:**
```json
{
  "status": "success",
  "data": {
    "students": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@school.com",
        "phone": "1234567890",
        "student_id": "STU001",
        "class": "10th Grade",
        "section": "A",
        "status": "active",
        "created_at": "2025-01-15T09:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 50,
      "records_per_page": 10
    }
  }
}
```

### **Attendance Marking Response:**
```json
{
  "status": "success",
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "id": 156,
      "student_id": 1,
      "date": "2025-10-06",
      "status": "present",
      "marked_by": "Teacher Smith",
      "remarks": "On time",
      "created_at": "2025-10-06T09:15:32.000Z",
      "name": "John Doe",
      "student_code": "STU001"
    },
    "real_time": true,
    "broadcast_sent": true
  }
}
```

---

## 🎨 Frontend Integration Guidelines

### **1. Authentication Flow:**
```javascript
// Login process
const login = async (credentials) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.setItem('token', data.data.token);
    setupSocketConnection(data.data.token);
  }
};
```

### **2. API Request Helper:**
```javascript
// API request helper with authentication
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };
  
  const response = await fetch(`http://localhost:3000${url}`, config);
  return response.json();
};
```

### **3. Real-time Integration:**
```javascript
// Socket.IO setup with authentication
const setupSocketConnection = (token) => {
  const socket = io('http://localhost:3000', {
    auth: { token }
  });
  
  // Handle real-time updates
  socket.on('attendance-marked', updateAttendanceList);
  socket.on('live-stats-update', updateDashboard);
  socket.on('notification', showNotification);
  
  return socket;
};
```

### **4. Data Fetching Examples:**
```javascript
// Fetch students with search and pagination
const fetchStudents = async (page = 1, search = '', classFilter = '') => {
  const params = new URLSearchParams({
    page,
    limit: 10,
    ...(search && { search }),
    ...(classFilter && { class: classFilter })
  });
  
  return apiRequest(`/api/v1/students?${params}`);
};

// Mark attendance
const markAttendance = async (attendanceData) => {
  return apiRequest('/api/v1/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  });
};

// Get dashboard data
const getDashboardData = async (dateRange = {}) => {
  const params = new URLSearchParams(dateRange);
  return apiRequest(`/api/v1/reports/dashboard?${params}`);
};
```

---

## 📱 Recommended Frontend Features

### **1. Dashboard Components:**
- **Live Statistics Cards** (Total Students, Today's Attendance, etc.)
- **Attendance Rate Charts** (Line/Bar charts)
- **Recent Activities Timeline**
- **Top Performers List**
- **Real-time Notifications Panel**

### **2. Student Management:**
- **Student List with Search/Filter**
- **Student Profile Pages**
- **Add/Edit Student Forms**
- **Student Attendance History**
- **Student Activity Timeline**

### **3. Attendance Features:**
- **Daily Attendance Marking Interface**
- **Bulk Attendance Import**
- **Attendance Calendar View**
- **Class-wise Attendance Grid**
- **Attendance Reports with Date Filters**

### **4. Activity Management:**
- **Activity Creation Forms**
- **Activity Timeline/Feed**
- **Point System Display**
- **Activity Type Filters**
- **Student Activity Profiles**

### **5. Reports & Analytics:**
- **Interactive Dashboard**
- **Downloadable Reports (PDF/CSV)**
- **Date Range Selectors**
- **Chart Visualizations**
- **Export Functionality**

### **6. Gamification Elements:**
- **Leaderboards**
- **Achievement Badges**
- **Progress Bars**
- **Streak Counters**
- **Point Systems**

---

## 🔧 Error Handling

### **Standard Error Response:**
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ],
  "timestamp": "2025-10-06T10:30:15.000Z"
}
```

### **HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Development Tips

### **1. Environment Setup:**
```javascript
// Frontend environment variables
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_APP_NAME=Student Attendance Tracker
```

### **2. State Management Suggestions:**
- Use **Redux Toolkit** or **Zustand** for global state
- Implement **React Query** for API data fetching and caching
- Use **Socket.IO Client** for real-time features

### **3. UI Framework Recommendations:**
- **Material-UI** or **Ant Design** for components
- **Chart.js** or **Recharts** for data visualization
- **React Router** for navigation
- **React Hook Form** for form handling

---

## 📊 Sample Frontend Implementation

### **Dashboard Component Example:**
```jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
    
    // Setup Socket.IO
    const socketConnection = io('http://localhost:3000');
    setSocket(socketConnection);
    
    // Listen for real-time updates
    socketConnection.on('live-stats-update', (newStats) => {
      setStats(prevStats => ({ ...prevStats, ...newStats }));
    });
    
    return () => socketConnection.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/reports/dashboard');
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Student Attendance Dashboard</h1>
      {stats && (
        <div className="stats-grid">
          <StatCard 
            title="Total Students" 
            value={stats.summary.students.total_students} 
          />
          <StatCard 
            title="Today's Attendance" 
            value={`${stats.summary.attendance.overall_attendance_rate}%`} 
          />
          {/* More stat cards */}
        </div>
      )}
    </div>
  );
};
```

---

This comprehensive documentation provides everything you need to build a complete frontend for the Student Attendance Tracker system! 🚀

**Key Integration Points:**
1. **RESTful APIs** for all CRUD operations
2. **Real-time Socket.IO** for live updates
3. **Comprehensive data models** for type safety
4. **Error handling patterns** for robust UX
5. **Authentication flow** for security
6. **Sample responses** for development guidance