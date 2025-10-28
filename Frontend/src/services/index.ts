import api from './api';
import { 
  Student, 
  ApiResponse, 
  StudentsResponse,
  AttendanceResponse,
  ActivitiesResponse,
  DashboardStats,
  ActivityLeaderboard,
  Attendance,
  Activity 
} from '../types';

// Auth API
export const authApi = {
  login: (credentials: {
    username: string;
    password: string;
  }) => api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', credentials),
  
  register: (userData: {
    username: string;
    password: string;
    email?: string;
    full_name?: string;
  }) => api.post<ApiResponse<{ user: any }>>('/auth/register', userData),
  
  getProfile: () => api.get<ApiResponse<{ user: any }>>('/auth/me'),
  
  logout: () => api.post<ApiResponse<any>>('/auth/logout'),
};

// Students API
export const studentsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<StudentsResponse>>('/students', { params }),
  
  getById: (id: number) => api.get<ApiResponse<{ student: Student }>>(`/students/${id}`),
  
  create: (student: Partial<Student>) => 
    api.post<ApiResponse<{ student: Student }>>('/students', student),
  
  update: (id: number, student: Partial<Student>) => 
    api.put<ApiResponse<{ student: Student }>>(`/students/${id}`, student),
  
  delete: (id: number) => api.delete<ApiResponse<any>>(`/students/${id}`),
  
  getAttendanceSummary: (id: number, params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get<ApiResponse<any>>(`/students/${id}/attendance-summary`, { params }),
  
  importStudents: (file: FormData) => 
    api.post<ApiResponse<{ imported: number; errors: any[] }>>('/students/import', file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    student_id?: number;
    status?: string;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<AttendanceResponse>>('/attendance', { params }),
  
  getByDate: (date: string) => 
    api.get<ApiResponse<{ date: string; attendance: Attendance[]; summary: any }>>(`/attendance/date/${date}`),
  
  mark: (attendance: {
    student_id: number;
    date: string;
    status: 'present' | 'absent' | 'late';
    marked_by?: string;
    remarks?: string;
  }) => api.post<ApiResponse<{ attendance: Attendance }>>('/attendance', attendance),
  
  markBulk: (attendanceData: {
    date: string;
    class?: string;
    section?: string;
    records: Array<{
      student_id: number;
      status: 'present' | 'absent' | 'late';
      remarks?: string;
    }>;
    marked_by?: string;
  }) => api.post<ApiResponse<{ saved: number; errors: any[] }>>('/attendance/bulk', attendanceData),
  
  update: (id: number, attendance: Partial<Attendance>) => 
    api.put<ApiResponse<{ attendance: Attendance }>>(`/attendance/${id}`, attendance),
  
  getStatistics: (params?: {
    start_date?: string;
    end_date?: string;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<any>>('/attendance/statistics', { params }),
};

// Activities API
export const activitiesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    student_id?: number;
    activity_type?: string;
    status?: string;
  }) => api.get<ApiResponse<ActivitiesResponse>>('/activities', { params }),
  
  getStatistics: () => api.get<ApiResponse<any>>('/activities/statistics/overview'),
  
  getById: (id: number) => api.get<ApiResponse<{ activity: Activity }>>(`/activities/${id}`),
  
  create: (activity: {
    student_id: number;
    title: string;
    activity_type: 'academic' | 'sports' | 'cultural' | 'technical' | 'other';
    description?: string;
    date: string;
    points?: number;
    status?: 'completed' | 'pending' | 'cancelled';
    recorded_by?: string;
  }) => api.post<ApiResponse<{ activity: Activity }>>('/activities', activity),
  
  update: (id: number, activity: Partial<Activity>) => 
    api.put<ApiResponse<{ activity: Activity }>>(`/activities/${id}`, activity),
  
  delete: (id: number) => api.delete<ApiResponse<any>>(`/activities/${id}`),
  
  getStudentActivities: (studentId: number, params?: {
    start_date?: string;
    end_date?: string;
    activity_type?: string;
  }) => api.get<ApiResponse<{ activities: Activity[] }>>(`/students/${studentId}/activities`, { params }),
};

// Reports API
export const reportsApi = {
  getDashboard: (params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get<ApiResponse<DashboardStats>>('/reports/dashboard', { params }),
  
  getStudentAttendance: (studentId: number, params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get<ApiResponse<any>>(`/reports/attendance/${studentId}`, { params }),
  
  getAttendanceReport: (params?: {
    start_date?: string;
    end_date?: string;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<any>>('/reports/attendance', { params }),
  
  getActivityReport: (params?: {
    start_date?: string;
    end_date?: string;
    activity_type?: string;
  }) => api.get<ApiResponse<any>>('/reports/activities', { params }),
  
  getAttendanceTrends: (params?: {
    start_date?: string;
    end_date?: string;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<any>>('/reports/attendance-trends', { params }),
  
  getActivityDistribution: (params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get<ApiResponse<any>>('/reports/activity-distribution', { params }),
  
  getClassPerformance: (params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get<ApiResponse<any>>('/reports/class-performance', { params }),
  
  exportReport: (type: 'csv' | 'pdf', reportType: string, params?: any) => 
    api.get(`/reports/export`, { 
      params: { type, reportType, ...params },
      responseType: 'blob'
    }),
};

// Streaks API
export const streaksApi = {
  getAll: (params?: {
    limit?: number;
    class?: string;
    section?: string;
  }) => api.get<ApiResponse<any>>('/streaks', { params }),
  
  getStreak: (studentId: number) => 
    api.get<ApiResponse<{
      current_streak: number;
      total_present_days: number;
      total_days: number;
    }>>(`/streaks/${studentId}`),
};