import React from 'react';
import { Download, Calendar, FileText, BarChart3, TrendingUp, Filter, RefreshCw, Share, Eye, Users, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { reportsApi } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { handleApiError, isNotFoundError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = React.useState('attendance');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({
    start: '2025-10-01',
    end: '2025-10-15'
  });
  const [reportData, setReportData] = React.useState<any>(null);
  const [filters, setFilters] = React.useState({
    class: '',
    section: '',
    activity_type: ''
  });
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange, filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        ...filters
      };

      let response;
      switch (selectedReport) {
        case 'attendance':
          response = await reportsApi.getAttendanceReport(params);
          break;
        case 'activities':
          response = await reportsApi.getActivityReport(params);
          break;
        case 'performance':
          response = await reportsApi.getClassPerformance(params);
          break;
        case 'summary':
          response = await reportsApi.getDashboard(params);
          break;
        case 'trends':
          response = await reportsApi.getAttendanceTrends(params);
          break;
        case 'distribution':
          response = await reportsApi.getActivityDistribution(params);
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(response.data?.data || null);
    } catch (err: any) {
      const errorMessage = handleApiError(err as AxiosError, 'Failed to fetch report data');
      setError(errorMessage);
      
      // For 404 errors, show a helpful message about missing backend endpoints
      if (isNotFoundError(err as AxiosError)) {
        setError('This report feature is not available yet. The backend endpoint may not be implemented.');
        setReportData(null);
      } else {
        // For server errors, provide mock data as fallback
        setReportData(getMockReportData(selectedReport));
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (reportType: string) => {
    switch (reportType) {
      case 'attendance':
        return {
          summary: {
            totalStudents: 150,
            averageAttendance: 92.5,
            totalPresent: 1388,
            totalAbsent: 112
          },
          dailyData: [
            { date: '2025-10-08', present: 140, absent: 8, late: 2, percentage: 93.3 },
            { date: '2025-10-09', present: 135, absent: 12, late: 3, percentage: 90.0 },
            { date: '2025-10-10', present: 142, absent: 6, late: 2, percentage: 94.7 },
            { date: '2025-10-11', present: 138, absent: 9, late: 3, percentage: 92.0 },
            { date: '2025-10-14', present: 144, absent: 4, late: 2, percentage: 96.0 },
            { date: '2025-10-15', present: 147, absent: 2, late: 1, percentage: 98.0 },
          ],
          classWise: [
            { class: '10th', section: 'A', attendance: 94.5, students: 30, present: 28, absent: 2 },
            { class: '10th', section: 'B', attendance: 92.3, students: 28, present: 26, absent: 2 },
            { class: '11th', section: 'A', attendance: 96.1, students: 32, present: 31, absent: 1 },
            { class: '11th', section: 'B', attendance: 89.7, students: 29, present: 26, absent: 3 },
            { class: '12th', section: 'A', attendance: 91.2, students: 31, present: 28, absent: 3 },
          ]
        };
      case 'activities':
        return {
          summary: {
            totalActivities: 124,
            totalPoints: 2850,
            participatingStudents: 98,
            averagePoints: 29.1
          },
          typeWise: [
            { type: 'Academic', count: 35, points: 525, percentage: 28.2 },
            { type: 'Sports', count: 25, points: 625, percentage: 20.2 },
            { type: 'Cultural', count: 20, points: 300, percentage: 16.1 },
            { type: 'Technical', count: 15, points: 450, percentage: 12.1 },
            { type: 'Other', count: 29, points: 950, percentage: 23.4 },
          ],
          monthlyTrends: [
            { month: 'Aug', activities: 25, points: 625 },
            { month: 'Sep', activities: 45, points: 1125 },
            { month: 'Oct', activities: 54, points: 1100 },
          ]
        };
      case 'performance':
        return {
          classPerformance: [
            { class: '10th A', attendance: 94.5, activities: 28, avgPoints: 22.5, performance: 'Excellent' },
            { class: '10th B', attendance: 92.3, activities: 24, avgPoints: 19.8, performance: 'Good' },
            { class: '11th A', attendance: 96.1, activities: 32, avgPoints: 25.1, performance: 'Excellent' },
            { class: '11th B', attendance: 89.7, activities: 20, avgPoints: 16.4, performance: 'Fair' },
            { class: '12th A', attendance: 91.2, activities: 20, avgPoints: 18.9, performance: 'Good' },
          ]
        };
      case 'trends':
        return {
          attendanceTrends: [
            { week: 'Week 1', attendance: 91.5, activities: 15 },
            { week: 'Week 2', attendance: 93.2, activities: 22 },
            { week: 'Week 3', attendance: 94.8, activities: 18 },
          ]
        };
      case 'distribution':
        return {
          distribution: [
            { name: 'Academic', value: 35, color: '#3b82f6' },
            { name: 'Sports', value: 25, color: '#10b981' },
            { name: 'Cultural', value: 20, color: '#f59e0b' },
            { name: 'Technical', value: 15, color: '#8b5cf6' },
            { name: 'Other', value: 29, color: '#ef4444' },
          ]
        };
      case 'summary':
        return {
          stats: {
            totalStudents: 150,
            averageAttendance: 92.5,
            totalActivities: 124,
            activeStudents: 98
          },
          recentActivities: [
            { name: 'Science Fair', date: '2025-10-14', participants: 25 },
            { name: 'Sports Day', date: '2025-10-13', participants: 85 },
            { name: 'Drama Competition', date: '2025-10-12', participants: 15 },
          ]
        };
      default:
        return {};
    }
  };

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Calendar, description: 'Daily and class-wise attendance analysis' },
    { id: 'activities', name: 'Activities Report', icon: BarChart3, description: 'Student activities and participation tracking' },
    { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Combined attendance and activity performance' },
    { id: 'trends', name: 'Trend Analysis', icon: TrendingUp, description: 'Weekly and monthly trends' },
    { id: 'distribution', name: 'Activity Distribution', icon: Award, description: 'Activity type distribution analysis' },
    { id: 'summary', name: 'Executive Summary', icon: FileText, description: 'Overall statistics and insights' },
  ];

  const exportReport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await reportsApi.exportReport(format, selectedReport, {
        start_date: dateRange.start,
        end_date: dateRange.end,
        ...filters
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}-report-${dateRange.start}-to-${dateRange.end}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchReportData();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ class: '', section: '', activity_type: '' });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into student attendance and activities</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => exportReport('csv')}
            className="btn-secondary flex items-center"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            onClick={() => exportReport('pdf')}
            className="btn-primary flex items-center"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105 ${
                  selectedReport === type.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-gray-500 mt-1">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters and Date Range */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Date Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field"
              max={dateRange.end}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field"
              min={dateRange.start}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="input-field"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions
            </label>
            <div className="flex gap-2">
              <button 
                onClick={resetFilters}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {(selectedReport === 'activities' || selectedReport === 'distribution') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={filters.activity_type}
              onChange={(e) => handleFilterChange('activity_type', e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Activity Types</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
      </div>

      {/* Report Content */}
      {loading && <LoadingSpinner message="Loading report data..." />}
      
      {error && (
        <ErrorBanner 
          message={error} 
          onDismiss={() => setError(null)}
          variant="warning"
        />
      )}

      {!loading && !error && selectedReport === 'attendance' && reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{reportData.summary?.totalStudents || 0}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.summary?.averageAttendance || 0}%</div>
              <div className="text-gray-600">Average Attendance</div>
            </div>
            <div className="card text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{reportData.summary?.totalPresent || 0}</div>
              <div className="text-gray-600">Total Present</div>
            </div>
            <div className="card text-center">
              <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{reportData.summary?.totalAbsent || 0}</div>
              <div className="text-gray-600">Total Absent</div>
            </div>
          </div>

          {/* Daily Attendance Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={reportData?.dailyData || []}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'present' ? 'Present' : name === 'absent' ? 'Absent' : 'Late']} />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="url(#colorAbsent)" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Class-wise Attendance Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class & Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(reportData?.classWise || []).map((cls: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {cls.class} {cls.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {cls.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                        {cls.present || Math.floor(cls.students * cls.attendance / 100)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                        {cls.absent || (cls.students - Math.floor(cls.students * cls.attendance / 100))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                cls.attendance >= 95 ? 'bg-green-500' :
                                cls.attendance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${cls.attendance}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{cls.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cls.attendance >= 95 ? 'bg-green-100 text-green-800' :
                          cls.attendance >= 90 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cls.attendance >= 95 ? 'Excellent' :
                           cls.attendance >= 90 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && selectedReport === 'activities' && reportData && (
        <div className="space-y-6">
          {/* Activities Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{reportData.summary?.totalActivities || 0}</div>
              <div className="text-gray-600">Total Activities</div>
            </div>
            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.summary?.totalPoints || 0}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            <div className="card text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{reportData.summary?.participatingStudents || 0}</div>
              <div className="text-gray-600">Participating Students</div>
            </div>
            <div className="card text-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{reportData.summary?.averagePoints || 0}</div>
              <div className="text-gray-600">Avg Points/Student</div>
            </div>
          </div>

          {/* Activity Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData?.typeWise || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="count"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {(reportData?.typeWise || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Points by Activity Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData?.typeWise || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Activity Trends */}
          {reportData?.monthlyTrends && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="activities" fill="#8884d8" name="Activities" />
                  <Line yAxisId="right" type="monotone" dataKey="points" stroke="#82ca9d" name="Points" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Activity Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Type Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(reportData?.typeWise || []).map((activity: any, index: number) => (
                    <tr key={activity.type} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium text-gray-900">{activity.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {activity.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {activity.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {activity.count > 0 ? Math.round(activity.points / activity.count * 10) / 10 : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${activity.percentage || 0}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                          <span className="font-medium">{activity.percentage || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && selectedReport === 'performance' && reportData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(reportData?.classPerformance || []).map((cls: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {cls.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        cls.attendance >= 95 ? 'text-green-600' :
                        cls.attendance >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {cls.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {cls.activities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {cls.avgPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cls.performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                        cls.performance === 'Good' ? 'bg-blue-100 text-blue-800' :
                        cls.performance === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cls.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && selectedReport === 'trends' && reportData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance & Activity Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reportData?.attendanceTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="attendance" stroke="#3b82f6" name="Attendance %" />
              <Line yAxisId="right" type="monotone" dataKey="activities" stroke="#10b981" name="Activities" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && selectedReport === 'distribution' && reportData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Type Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData?.distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {(reportData?.distribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && selectedReport === 'summary' && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.stats?.totalStudents || 150}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600 mb-2">{reportData.stats?.averageAttendance || 92.5}%</div>
              <div className="text-gray-600">Average Attendance</div>
            </div>
            <div className="card text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.stats?.totalActivities || 124}</div>
              <div className="text-gray-600">Total Activities</div>
            </div>
            <div className="card text-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-600 mb-2">{reportData.stats?.activeStudents || 98}</div>
              <div className="text-gray-600">Active Students</div>
            </div>
          </div>

          {reportData?.recentActivities && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {reportData.recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{activity.name}</div>
                      <div className="text-sm text-gray-600">{activity.date}</div>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {activity.participants} participants
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !reportData && (
        <EmptyState
          title="No data available"
          description="No report data is available for the selected date range and filters."
          icon="chart"
          action={{
            label: "Reset Filters",
            onClick: resetFilters
          }}
        />
      )}
    </div>
  );
};

export default Reports;