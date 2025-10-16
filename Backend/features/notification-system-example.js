// Add to package.json:
// "nodemailer": "^6.9.7",
// "node-cron": "^3.0.2"

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const db = require('../config/database');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Low attendance notification
const sendLowAttendanceAlert = async () => {
  try {
    const [lowAttendanceStudents] = await db.execute(`
      SELECT 
        s.name, 
        s.email,
        ROUND(AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100, 2) as attendance_rate
      FROM students s
      JOIN attendance a ON s.id = a.student_id
      WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.email
      HAVING attendance_rate < 75
    `);

    for (const student of lowAttendanceStudents) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Low Attendance Alert',
        html: `
          <h2>Attendance Alert</h2>
          <p>Dear ${student.name},</p>
          <p>Your attendance rate is ${student.attendance_rate}% which is below 75%.</p>
          <p>Please improve your attendance.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    console.log(`Low attendance alerts sent to ${lowAttendanceStudents.length} students`);
  } catch (error) {
    console.error('Failed to send low attendance alerts:', error);
  }
};

// Schedule daily at 9 AM
cron.schedule('0 9 * * *', sendLowAttendanceAlert);

module.exports = { sendLowAttendanceAlert };