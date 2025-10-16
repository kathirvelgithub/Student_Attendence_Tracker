// Types for the Student Attendance Tracker application

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  student_id?: string;
  class?: string;
  section?: string;
  status: 'active' | 'inactive';
  date_of_birth?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from students table
  name?: string;
  email?: string;
  student_code?: string;
  class?: string;
  section?: string;
}

export interface Activity {
  id: number;
  student_id: number;
  activity_name: string;
  activity_type: 'academic' | 'sports' | 'cultural' | 'technical' | 'other';
  description?: string;
  activity_date: string;
  points: number;
  status: 'participated' | 'won' | 'completed' | 'pending';
  recorded_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from students table
  name?: string;
  email?: string;
  student_code?: string;
  class?: string;
  section?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'staff';
  full_name: string;
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_records: number;
  records_per_page: number;
}

export interface StudentsResponse {
  students: Student[];
  pagination: PaginationInfo;
}

export interface AttendanceResponse {
  attendance: Attendance[];
  pagination: PaginationInfo;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: PaginationInfo;
}

export interface DashboardStats {
  summary: {
    students: {
      total_students: number;
      active_students: number;
      inactive_students: number;
    };
    attendance: {
      total_attendance_records: number;
      students_with_attendance: number;
      total_days_tracked: number;
      total_present: number;
      total_absent: number;
      total_late: number;
      overall_attendance_rate: number;
    };
    activities: {
      total_activities: number;
      students_with_activities: number;
      total_points_awarded: number;
      average_points_per_activity: number;
    };
  };
  attendance_trends: Array<{
    date: string;
    total_marked: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    attendance_rate: number;
  }>;
  top_students: Array<{
    name: string;
    student_code: string;
    class: string;
    section: string;
    activity_count: number;
    total_points: number;
    attendance_rate: number;
  }>;
}

export interface Ranking {
  id: number;
  name: string;
  student_code: string;
  class: string;
  section: string;
  total_days: number;
  present_days: number;
  attendance_percentage: number;
  rank_position: number;
}

export interface ActivityLeaderboard {
  id: number;
  name: string;
  student_code: string;
  class: string;
  section: string;
  total_activities: number;
  total_points: number;
  average_points: number;
  rank_position: number;
}