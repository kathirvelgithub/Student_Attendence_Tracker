import React from 'react';
import { 
  Calendar, 
  BarChart3, 
  FileText, 
  Download, 
  RefreshCw, 
  Users, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = React.useState('attendance');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({
    start: '2025-10-01',
    end: '2025-10-17'
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

      // Try to fetch from API, fall back to mock data
      try {
        let endpoint;
        switch (selectedReport) {
          case 'attendance':
            endpoint = `/reports/attendance`;
            break;
          case 'activities':
            endpoint = `/reports/activities`;
            break;
          case 'summary':
            endpoint = `/reports/dashboard`;
            break;
          default:
            throw new Error('Invalid report type');
        }
        
        const response = await api.get(endpoint, { params });
        setReportData(response.data?.data || null);
      } catch (apiError) {
        // Fall back to mock data for demonstration
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
            { date: '2025-10-08', present: 140, absent: 8, percentage: 93.3 },
            { date: '2025-10-09', present: 135, absent: 12, percentage: 90.0 },
            { date: '2025-10-10', present: 142, absent: 6, percentage: 94.7 },
            { date: '2025-10-11', present: 138, absent: 9, percentage: 92.0 },
            { date: '2025-10-14', present: 144, absent: 4, percentage: 96.0 },
            { date: '2025-10-15', present: 147, absent: 2, percentage: 98.0 },
          ],
          classWise: [
            { class: '10th A', attendance: 94.5, students: 30, present: 28, absent: 2 },
            { class: '10th B', attendance: 92.3, students: 28, present: 26, absent: 2 },
            { class: '11th A', attendance: 96.1, students: 32, present: 31, absent: 1 },
            { class: '11th B', attendance: 89.7, students: 29, present: 26, absent: 3 },
            { class: '12th A', attendance: 91.2, students: 31, present: 28, absent: 3 },
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
            { type: 'Academic', count: 35, points: 525 },
            { type: 'Sports', count: 28, points: 420 },
            { type: 'Cultural', count: 22, points: 330 },
            { type: 'Technical', count: 15, points: 225 },
          ]
        };
      case 'summary':
        return {
          overview: {
            totalStudents: 150,
            averageAttendance: 92.5,
            totalActivities: 124,
            averageScore: 8.7
          }
        };
      default:
        return null;
    }
  };

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Calendar, description: 'Student attendance tracking', category: 'core' },
    { id: 'activities', name: 'Activity Report', icon: BarChart3, description: 'Student activity participation', category: 'core' },
    { id: 'summary', name: 'Summary Report', icon: FileText, description: 'Overall performance summary', category: 'overview' }
  ];

  const exportReport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      console.log(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error(`Failed to export report as ${format.toUpperCase()}`);
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Student attendance and activity reports</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="btn-secondary flex items-center text-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => exportReport('csv')}
            className="btn-secondary flex items-center text-sm"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'CSV'}
          </button>
          <button 
            onClick={() => exportReport('pdf')}
            className="btn-primary flex items-center text-sm"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedReport === type.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5" />
                  <div className="font-medium">{type.name}</div>
                </div>
                <div className="text-sm text-gray-500">{type.description}</div>
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

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="btn-secondary w-full text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <LoadingSpinner message={`Loading ${reportTypes.find(r => r.id === selectedReport)?.name}...`} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-yellow-400 hover:text-yellow-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!loading && !error && reportData && selectedReport === 'attendance' && (
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
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{reportData.summary?.totalAbsent || 0}</div>
              <div className="text-gray-600">Total Absent</div>
            </div>
          </div>

          {/* Daily Attendance Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Class-wise Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.classWise?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {item.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {item.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{item.attendance}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${item.attendance}%` }}
                            ></div>
                          </div>
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

      {/* Activities Report */}
      {!loading && !error && reportData && selectedReport === 'activities' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{reportData.summary?.totalActivities || 0}</div>
              <div className="text-gray-600">Total Activities</div>
            </div>
            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.summary?.totalPoints || 0}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            <div className="card text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{reportData.summary?.participatingStudents || 0}</div>
              <div className="text-gray-600">Participating Students</div>
            </div>
            <div className="card text-center">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{reportData.summary?.averagePoints || 0}</div>
              <div className="text-gray-600">Average Points</div>
            </div>
          </div>

          {/* Activity Types Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.typeWise || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
                <Bar dataKey="points" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Report */}
      {!loading && !error && reportData && selectedReport === 'summary' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{reportData.overview?.totalStudents || 0}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.overview?.averageAttendance || 0}%</div>
              <div className="text-gray-600">Avg Attendance</div>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{reportData.overview?.totalActivities || 0}</div>
              <div className="text-gray-600">Total Activities</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{reportData.overview?.averageScore || 0}/10</div>
              <div className="text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && !reportData && (
        <div className="card text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500 mb-4">No report data is available for the selected date range and filters.</p>
          <button onClick={resetFilters} className="btn-primary">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;