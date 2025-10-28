# Student Activity & Attendance Tracker API

A comprehensive backend API for managing student records, tracking attendance, and logging activities in educational institutions. Now deployed with cloud database support (Railway MySQL).

## 🚀 Features

- **Student Management**: Complete CRUD operations for student records with parent information
- **Attendance Tracking**: Mark and track daily attendance with status (present/absent/late)
- **Activity Logging**: Record and manage student participation in various activities
- **Comprehensive Reporting**: Generate detailed reports and analytics
- **Real-time Updates**: Socket.IO integration for live data updates
- **Cloud Database**: Deployed with Railway MySQL for production scalability
- **Data Validation**: Input validation and error handling
- **Scalable Architecture**: Built with performance and scalability in mind

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Railway Cloud / TiDB Cloud / Local)
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Cloud Hosting**: Railway MySQL with SSL support
- **Development**: Nodemon for auto-restart

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js          # Database connection with SSL support
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation rules
├── routes/
│   ├── students.js          # Student management routes
│   ├── attendance.js        # Attendance tracking routes
│   ├── activities.js        # Activity management routes
│   ├── reports.js           # Reporting and analytics routes
│   ├── rankings.js          # Student rankings routes
│   └── streaks.js           # Attendance streaks routes
├── database/
│   ├── schema.sql           # Local database schema
│   ├── tidb_cloud_schema.sql  # Cloud database schema
│   └── setup-railway.js     # Railway database setup script
├── logs/
│   └── backend.log          # Application logs
├── server.js                # Main application entry point
├── package.json             # Project dependencies
├── .env.example             # Local environment template
├── .env.railway.example     # Railway environment template
└── README.md                # Project documentation
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other configurations.

4. **Set up the database**
   - Create a MySQL database
   - Run the SQL script from `database/schema.sql`
   ```bash
   mysql -u your_username -p your_database_name < database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📊 Database Schema

### Students Table
- `id` (Primary Key)
- `name` (Student name)
- `email` (Unique email address)
- `phone` (Contact number)
- `student_id` (Unique student identifier)
- `class` (Student's class)
- `section` (Class section)
- `status` (active/inactive)
- `date_of_birth` (Student's date of birth)
- `address` (Student's address)
- `parent_name` (Parent/Guardian name)
- `parent_phone` (Parent contact number)
- `parent_email` (Parent email address)
- `created_at`, `updated_at`

### Attendance Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `date` (Attendance date)
- `status` (present/absent/late)
- `marked_by` (Who marked the attendance)
- `remarks` (Additional notes)
- `created_at`, `updated_at`

### Activities Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `title` (Activity title)
- `activity_type` (academic/sports/cultural/other)
- `description` (Activity description)
- `date` (Date of activity)
- `points` (Points awarded, 0-1000)
- `status` (completed/pending/cancelled)
- `created_at`, `updated_at`

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Students
- `GET /api/v1/students` - Get all students (with pagination and search)
- `GET /api/v1/students/:id` - Get student by ID
- `POST /api/v1/students` - Create new student
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student (soft delete)
- `GET /api/v1/students/:id/attendance-summary` - Get student attendance summary
- `GET /api/v1/students/:id/activities` - Get student activities

### Attendance
- `GET /api/v1/attendance` - Get attendance records (with filters)
- `GET /api/v1/attendance/date/:date` - Get attendance by specific date
- `POST /api/v1/attendance` - Mark attendance
- `POST /api/v1/attendance/bulk` - Mark bulk attendance
- `PUT /api/v1/attendance/:id` - Update attendance record
- `DELETE /api/v1/attendance/:id` - Delete attendance record
- `GET /api/v1/attendance/statistics` - Get attendance statistics

### Activities
- `GET /api/v1/activities` - Get all activities (with filters)
- `GET /api/v1/activities/:id` - Get activity by ID
- `POST /api/v1/activities` - Create new activity
- `PUT /api/v1/activities/:id` - Update activity
- `DELETE /api/v1/activities/:id` - Delete activity
- `GET /api/v1/activities/statistics/overview` - Get activity statistics
- `GET /api/v1/activities/student/:student_id` - Get activities by student

### Reports
- `GET /api/v1/reports/dashboard` - Get dashboard statistics
- `GET /api/v1/reports/attendance/:student_id` - Student attendance report
- `GET /api/v1/reports/activities/:student_id` - Student activity report
- `GET /api/v1/reports/class-attendance` - Class-wise attendance report
- `GET /api/v1/reports/export/attendance` - Export attendance data

## 📝 API Usage Examples

### Create a Student
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "student_id": "STU001",
    "class": "10th Grade",
    "section": "A"
  }'
```

### Mark Attendance
```bash
curl -X POST http://localhost:3000/api/v1/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "date": "2024-01-15",
    "status": "present",
    "marked_by": "Teacher Name"
  }'
```

### Create an Activity
```bash
curl -X POST http://localhost:3000/api/v1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "title": "Science Fair",
    "activity_type": "academic",
    "description": "Participated in school science fair",
    "date": "2024-01-10",
    "points": 50,
    "status": "completed"
  }'
```

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Prevents abuse with request rate limiting
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Secure error responses without sensitive data exposure

## 🚀 Deployment

### Local Development
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_attendance_db
DB_PORT=3306
```

### Railway MySQL Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=maglev.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=your_railway_password
DB_NAME=railway
DB_PORT=24662
FRONTEND_URL=https://your-frontend-url.com
```

### Database Setup for Railway

1. **Install Railway CLI** (Optional)
   ```bash
   npm install -g @railway/cli
   ```

2. **Run Setup Script**
   ```bash
   node database/setup-railway.js
   ```
   This will:
   - Create all database tables
   - Set up indexes and foreign keys
   - Insert sample data

3. **Manual Setup** (Alternative)
   ```bash
   mysql -h your_host -P port -u user -p database < database/tidb_cloud_schema.sql
   ```

### Production Considerations
- ✅ SSL/TLS enabled for Railway and TiDB Cloud connections
- ✅ Connection pooling configured (max 10 connections)
- ✅ 60-second connection timeout for cloud databases
- ✅ Comprehensive logging to `logs/backend.log`
- Use a process manager like PM2 for production
- Set up monitoring and alerts
- Use HTTPS in production
- Regular database backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email karthirvela0@example.com or create an issue in the repository.

## 🎯 Recent Updates (v2.0)

- ✅ Migrated to Railway MySQL cloud database
- ✅ Added SSL support for cloud databases (Railway, TiDB Cloud)
- ✅ Updated activity schema (title, date instead of activity_name, activity_date)
- ✅ Enhanced student records with parent information
- ✅ Improved validation middleware
- ✅ Added comprehensive logging system
- ✅ Real-time updates with Socket.IO
- ✅ Sample data seeding for quick setup

## 🎯 Future Enhancements

- [ ] Real-time notifications via email/SMS
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard with charts
- [ ] Export to PDF/Excel reports
- [ ] Email notifications for low attendance
- [ ] Integration with school management systems
- [ ] Multi-school/organization support
- [ ] Advanced role-based permissions
- [ ] Biometric attendance integration
- [ ] Parent portal for attendance tracking
