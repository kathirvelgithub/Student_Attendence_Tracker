const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to Railway MySQL...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connected successfully!');
    console.log('📝 Creating tables...\n');
    
    // Students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        student_id VARCHAR(50) UNIQUE NOT NULL,
        class VARCHAR(100),
        section VARCHAR(10),
        status ENUM('active', 'inactive') DEFAULT 'active',
        date_of_birth DATE,
        address TEXT,
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        parent_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_class_section (class, section)
      )
    `);
    console.log('✅ Students table created');
    
    // Attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late') NOT NULL,
        marked_by VARCHAR(100),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_date (student_id, date),
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_student_date (student_id, date)
      )
    `);
    console.log('✅ Attendance table created');
    
    // Activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        activity_type ENUM('academic', 'sports', 'cultural', 'other') DEFAULT 'other',
        points INT DEFAULT 0,
        date DATE NOT NULL,
        status ENUM('completed', 'pending', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_date (date),
        INDEX idx_type (activity_type),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Activities table created');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Inserting sample data...\n');
    
    // Insert sample students
    await connection.execute(`
      INSERT INTO students (name, email, phone, student_id, class, section, date_of_birth, address, parent_name, parent_phone, parent_email) 
      VALUES 
        ('Rajesh Kumar', 'rajesh@example.com', '9876543210', 'STU001', '10', 'A', '2008-05-15', 'Chennai, Tamil Nadu', 'Suresh Kumar', '9876543211', 'suresh@example.com'),
        ('Priya Sharma', 'priya@example.com', '9876543212', 'STU002', '10', 'A', '2008-07-20', 'Mumbai, Maharashtra', 'Vijay Sharma', '9876543213', 'vijay@example.com'),
        ('Amit Patel', 'amit@example.com', '9876543214', 'STU003', '10', 'B', '2008-03-10', 'Ahmedabad, Gujarat', 'Ramesh Patel', '9876543215', 'ramesh@example.com')
      ON DUPLICATE KEY UPDATE name=name
    `);
    console.log('✅ Sample students inserted');
    
    // Insert sample attendance
    const today = new Date().toISOString().split('T')[0];
    await connection.execute(`
      INSERT INTO attendance (student_id, date, status, marked_by) 
      VALUES 
        (1, '${today}', 'present', 'Admin'),
        (2, '${today}', 'present', 'Admin'),
        (3, '${today}', 'late', 'Admin')
      ON DUPLICATE KEY UPDATE status=status
    `);
    console.log('✅ Sample attendance inserted');
    
    // Insert sample activities
    await connection.execute(`
      INSERT INTO activities (student_id, title, description, activity_type, points, date, status) 
      VALUES 
        (1, 'Math Quiz Winner', 'Won first place in inter-class math quiz', 'academic', 50, '${today}', 'completed'),
        (2, 'Science Project', 'Working on solar system model', 'academic', 30, '${today}', 'pending'),
        (3, 'Sports Day', 'Participated in 100m race', 'sports', 20, '${today}', 'completed')
    `);
    console.log('✅ Sample activities inserted');
    
    console.log('\n✨ All done! Your Railway database is ready to use.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Connection closed');
    }
  }
}

setupDatabase();
