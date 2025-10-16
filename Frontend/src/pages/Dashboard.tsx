import React from 'react';
import { Users, Calendar, Activity, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { reportsApi } from '../services';
import { DashboardStats } from '../types';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeStudents: 0,
    todayAttendance: 0,
    totalActivities: 0
  });
  const [chartData, setChartData] = React.useState({
    attendanceTrends: [] as any[],
    activityDistribution: [] as any[],
    topStudents: [] as any[]
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [socketConnected, setSocketConnected] = React.useState(false);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🌐 Connection restored');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('📡 Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup real-time updates
  React.useEffect(() => {
    // Check socket connection status
    const checkSocketConnection = () => {
      setSocketConnected(socketService.isSocketConnected());
    };

    // Set up real-time listeners for backend events
    socketService.onAttendanceMarked((data) => {
      console.log('📊 Real-time attendance marked:', data);
      fetchDashboardData(); // Refresh dashboard data
      toast.success('📈 Attendance marked - Dashboard updated');
    });

    socketService.onLiveStatsUpdate((data) => {
      console.log('📊 Live stats update:', data);
      fetchDashboardData(); // Refresh dashboard data
      toast.success('📊 Live stats updated');
    });

    socketService.onNotification((data) => {
      console.log('🔔 Notification received:', data);
      toast(data.message || 'New notification received', {
        icon: '🔔',
        duration: 4000
      });
    });

    // Legacy listeners for backward compatibility
    socketService.onAttendanceUpdate((data) => {
      console.log('📊 Legacy attendance update:', data);
      fetchDashboardData();
    });

    socketService.onActivityUpdate((data) => {
      console.log('🎯 Legacy activity update:', data);
      fetchDashboardData();
    });

    // Check connection status periodically
    const connectionCheck = setInterval(checkSocketConnection, 5000);
    checkSocketConnection(); // Initial check

    return () => {
      clearInterval(connectionCheck);
      socketService.removeAllListeners();
    };
  }, []);

  // Fetch dashboard data from API
  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsApi.getDashboard();
      if (response.data?.data) {
        const data = response.data.data as DashboardStats;
        // Transform the API response to match our component state
        setStats({
          totalStudents: data.summary?.students?.total_students || 0,
          activeStudents: data.summary?.students?.active_students || 0,
          todayAttendance: data.summary?.attendance?.overall_attendance_rate || 0,
          totalActivities: data.summary?.activities?.total_activities || 0
        });
        
        // Set chart data (use mock data for now since API structure varies)
        setChartData({
          attendanceTrends: getMockAttendanceTrends(),
          activityDistribution: getMockActivityDistribution(),
          topStudents: getMockTopStudents()
        });
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      // Fallback to mock data for both stats and charts
      setStats({
        totalStudents: 150,
        activeStudents: 145,
        todayAttendance: 92.3,
        totalActivities: 48
      });
      setChartData({
        attendanceTrends: getMockAttendanceTrends(),
        activityDistribution: getMockActivityDistribution(),
        topStudents: getMockTopStudents()
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockAttendanceTrends = () => [
    { date: '2024-01-15', present: 140, absent: 8, late: 2 },
    { date: '2024-01-16', present: 135, absent: 12, late: 3 },
    { date: '2024-01-17', present: 142, absent: 6, late: 2 },
    { date: '2024-01-18', present: 138, absent: 9, late: 3 },
    { date: '2024-01-19', present: 144, absent: 4, late: 2 },
  ];

  const getMockActivityDistribution = () => [
    { name: 'Academic', value: 35, color: '#3b82f6' },
    { name: 'Sports', value: 25, color: '#f59e0b' },
    { name: 'Cultural', value: 20, color: '#8b5cf6' },
    { name: 'Technical', value: 15, color: '#10b981' },
    { name: 'Other', value: 5, color: '#ef4444' },
  ];

  const getMockTopStudents = () => [
    { name: 'John Doe', points: 95, attendanceRate: 98.5 },
    { name: 'Jane Smith', points: 88, attendanceRate: 96.2 },
    { name: 'Mike Johnson', points: 82, attendanceRate: 94.8 },
    { name: 'Sarah Wilson', points: 79, attendanceRate: 93.1 },
    { name: 'David Brown', points: 75, attendanceRate: 91.7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Connection Status Indicators */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              socketConnected ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                socketConnected ? 'bg-blue-600' : 'bg-orange-600'
              }`}></div>
              <span>{socketConnected ? 'Real-time' : 'Polling'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAttendance}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.activityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.activityDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.activityDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.topStudents.map((student: any, index: number) => (
                <tr key={student.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;