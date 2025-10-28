-- Railway MySQL Schema Creation Script
-- Run this on your Railway MySQL database

-- Use the railway database (Railway default)
USE railway;

-- Students table
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
);

-- Attendance table
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
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_type ENUM('academic', 'sports', 'cultural', 'technical', 'other') DEFAULT 'other',
    description TEXT,
    activity_date DATE NOT NULL,
    points INT DEFAULT 0,
    status ENUM('participated', 'won', 'completed', 'pending') DEFAULT 'participated',
    recorded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_activity_date (activity_date),
    INDEX idx_activity_type (activity_type),
    INDEX idx_status (status)
);

-- Insert sample data
INSERT INTO students (name, email, phone, student_id, class, section) VALUES
('John Doe', 'john.doe@example.com', '1234567890', 'STU001', '10th Grade', 'A'),
('Jane Smith', 'jane.smith@example.com', '1234567891', 'STU002', '10th Grade', 'A'),
('Mike Johnson', 'mike.johnson@example.com', '1234567892', 'STU003', '10th Grade', 'B'),
('Sarah Wilson', 'sarah.wilson@example.com', '1234567893', 'STU004', '11th Grade', 'A'),
('David Brown', 'david.brown@example.com', '1234567894', 'STU005', '11th Grade', 'B');

-- Sample attendance records
INSERT INTO attendance (student_id, date, status, marked_by) VALUES
(1, '2024-01-15', 'present', 'Teacher A'),
(2, '2024-01-15', 'present', 'Teacher A'),
(3, '2024-01-15', 'absent', 'Teacher A'),
(4, '2024-01-15', 'present', 'Teacher B'),
(5, '2024-01-15', 'late', 'Teacher B'),
(1, '2024-01-16', 'present', 'Teacher A'),
(2, '2024-01-16', 'absent', 'Teacher A'),
(3, '2024-01-16', 'present', 'Teacher A');

-- Sample activity records
INSERT INTO activities (student_id, activity_name, activity_type, description, activity_date, points, status, recorded_by) VALUES
(1, 'Science Fair', 'academic', 'Participated in school science fair', '2024-01-10', 10, 'participated', 'Teacher A'),
(2, 'Basketball Tournament', 'sports', 'Won inter-class basketball tournament', '2024-01-12', 20, 'won', 'Sports Teacher'),
(3, 'Drama Competition', 'cultural', 'Performed in annual drama competition', '2024-01-14', 15, 'participated', 'Drama Teacher'),
(4, 'Coding Contest', 'technical', 'Participated in programming contest', '2024-01-16', 25, 'won', 'CS Teacher'),
(5, 'Art Exhibition', 'cultural', 'Displayed artwork in school exhibition', '2024-01-18', 12, 'participated', 'Art Teacher');