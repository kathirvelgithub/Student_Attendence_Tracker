# Student Activity & Attendance Tracker API

A comprehensive backend API for managing student records, tracking attendance, and logging activities in educational institutions.

## 🚀 Features

- **Student Management**: Complete CRUD operations for student records
- **Attendance Tracking**: Mark and track daily attendance with status (present/absent/late)
- **Activity Logging**: Record and manage student participation in various activities
- **Comprehensive Reporting**: Generate detailed reports and analytics
- **Secure Authentication**: JWT-based authentication with role-based access
- **Data Validation**: Input validation and error handling
- **Scalable Architecture**: Built with performance and scalability in mind

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon for auto-restart

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation rules
├── routes/
│   ├── students.js          # Student management routes
│   ├── attendance.js        # Attendance tracking routes
│   ├── activities.js        # Activity management routes
│   └── reports.js           # Reporting and analytics routes
├── database/
│   └── schema.sql           # Database schema and sample data
├── server.js                # Main application entry point
├── package.json             # Project dependencies
├── .env.example             # Environment variables template
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
- `activity_name` (Name of the activity)
- `activity_type` (academic/sports/cultural/technical/other)
- `description` (Activity description)
- `activity_date` (Date of activity)
- `points` (Points awarded)
- `status` (participated/won/completed/pending)
- `recorded_by` (Who recorded the activity)
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
    "activity_name": "Science Fair",
    "activity_type": "academic",
    "description": "Participated in school science fair",
    "activity_date": "2024-01-10",
    "points": 10,
    "status": "participated"
  }'
```

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Prevents abuse with request rate limiting
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Secure error responses without sensitive data exposure

## 🚀 Deployment

### Environment Variables
Make sure to set these environment variables in production:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_super_secret_jwt_key
```

### Production Considerations
- Use a process manager like PM2
- Set up proper logging
- Configure database connection pooling
- Implement database backups
- Set up monitoring and alerts
- Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email kathir@example.com or create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard
- [ ] Export to PDF reports
- [ ] Email notifications for low attendance
- [ ] Integration with school management systems
- [ ] Multi-school/organization support
- [ ] Advanced role-based permissions