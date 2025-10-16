import React from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Users, BookOpen, TrendingUp, Award, Activity } from 'lucide-react';
import { Student, Attendance, Activity as StudentActivity } from '../types';
import { studentsApi, attendanceApi, activitiesApi } from '../services';
import { handleApiError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface StudentDetailsModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
}

interface StudentStats {
  totalAttendance: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  totalActivities: number;
  totalPoints: number;
  recentActivities: StudentActivity[];
  recentAttendance: Attendance[];
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ 
  isOpen, 
  student, 
  onClose,
  onEdit 
}) => {
  const [loading, setLoading] = React.useState(false);
  const [studentDetails, setStudentDetails] = React.useState<Student | null>(null);
  const [stats, setStats] = React.useState<StudentStats | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'attendance' | 'activities'>('overview');

  // Load student details and stats when modal opens
  React.useEffect(() => {
    if (isOpen && student) {
      loadStudentDetails();
    }
  }, [isOpen, student]);

  const loadStudentDetails = async () => {
    if (!student) return;

    try {
      setLoading(true);
      
      // Load detailed student information
      let detailedStudent = student;
      try {
        const studentResponse = await studentsApi.getById(student.id);
        if (studentResponse.data?.data?.student) {
          detailedStudent = studentResponse.data.data.student;
        }
      } catch (err) {
        console.warn('Could not fetch detailed student info, using existing data');
      }

      // Load attendance summary
      let attendanceStats = {
        totalAttendance: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0,
        recentAttendance: [] as Attendance[]
      };

      try {
        const attendanceResponse = await attendanceApi.getAll({
          student_id: student.id,
          limit: 10
        });
        if (attendanceResponse.data?.data?.attendance) {
          const attendance = attendanceResponse.data.data.attendance;
          attendanceStats.recentAttendance = attendance;
          attendanceStats.totalAttendance = attendance.length;
          attendanceStats.presentDays = attendance.filter(a => a.status === 'present').length;
          attendanceStats.absentDays = attendance.filter(a => a.status === 'absent').length;
          attendanceStats.lateDays = attendance.filter(a => a.status === 'late').length;
          attendanceStats.attendancePercentage = attendanceStats.totalAttendance > 0 
            ? Math.round((attendanceStats.presentDays / attendanceStats.totalAttendance) * 100) 
            : 0;
        }
      } catch (err) {
        console.warn('Could not fetch attendance data');
      }

      // Load activities summary
      let activitiesStats = {
        totalActivities: 0,
        totalPoints: 0,
        recentActivities: [] as StudentActivity[]
      };

      try {
        const activitiesResponse = await activitiesApi.getAll({
          student_id: student.id,
          limit: 10
        });
        if (activitiesResponse.data?.data?.activities) {
          const activities = activitiesResponse.data.data.activities;
          activitiesStats.recentActivities = activities;
          activitiesStats.totalActivities = activities.length;
          activitiesStats.totalPoints = activities.reduce((sum, activity) => sum + (activity.points || 0), 0);
        }
      } catch (err) {
        console.warn('Could not fetch activities data');
      }

      setStudentDetails(detailedStudent);
      setStats({
        ...attendanceStats,
        ...activitiesStats
      });

    } catch (error) {
      console.error('Error loading student details:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    if (studentDetails && onEdit) {
      onEdit(studentDetails);
      onClose();
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete information and activity history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button 
                onClick={handleEdit}
                className="btn-secondary flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Student
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student details...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Student Header Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {studentDetails?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {studentDetails?.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Student ID:</span>
                        <p className="font-semibold text-gray-900">{studentDetails?.student_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <p className="font-semibold text-gray-900">
                          {studentDetails?.class} - {studentDetails?.section}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(studentDetails?.status || 'active')}`}>
                          {studentDetails?.status || 'Active'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Joined:</span>
                        <p className="font-semibold text-gray-900">
                          {studentDetails?.created_at ? formatDate(studentDetails.created_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-green-700">{stats.attendancePercentage}%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Present Days</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.presentDays}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600">Activities</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.totalActivities}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm text-orange-600">Total Points</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.totalPoints}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'attendance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Attendance History
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activities'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activities
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{studentDetails?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{studentDetails?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900">
                        {studentDetails?.date_of_birth ? formatDate(studentDetails.date_of_birth) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{studentDetails?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Parent/Guardian Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Parent Name</label>
                      <p className="text-gray-900">{studentDetails?.parent_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Parent Phone</label>
                      <p className="text-gray-900">{studentDetails?.parent_phone || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Parent Email</label>
                      <p className="text-gray-900">{studentDetails?.parent_email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h4>
                {stats?.recentAttendance.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Date</th>
                          <th className="text-left py-2 font-medium text-gray-600">Status</th>
                          <th className="text-left py-2 font-medium text-gray-600">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAttendance.map((record, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2">{formatDate(record.date)}</td>
                            <td className="py-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(record.status)}`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-2 text-gray-600">{record.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance records found</p>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h4>
                {stats?.recentActivities.length ? (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{activity.activity_name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-600">
                                Type: <span className="font-medium">{activity.activity_type}</span>
                              </span>
                              <span className="text-gray-600">
                                Date: <span className="font-medium">{formatDate(activity.activity_date)}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}>
                              {activity.status}
                            </span>
                            <p className="text-sm font-bold text-blue-600 mt-1">
                              +{activity.points} points
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No activities found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailsModal;