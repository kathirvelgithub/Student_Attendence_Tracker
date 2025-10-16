import React from 'react';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { rankingsApi } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { handleApiError, isNotFoundError } from '../utils/errorHandler';
import { AxiosError } from 'axios';

const Rankings: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('attendance');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rankingsData, setRankingsData] = React.useState<any>({});

  React.useEffect(() => {
    fetchRankingsData();
  }, [selectedTab]);

  const fetchRankingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      switch (selectedTab) {
        case 'attendance':
          response = await rankingsApi.getAttendanceRankings({ limit: 10 });
          break;
        case 'activities':
          response = await rankingsApi.getActivityLeaderboard({ limit: 10 });
          break;
        default:
          response = { data: { data: { rankings: [] } } };
      }
      
      setRankingsData((prev: any) => ({
        ...prev,
        [selectedTab]: (response.data?.data as any)?.rankings || (response.data?.data as any)?.leaderboard || []
      }));
    } catch (err: any) {
      const errorMessage = handleApiError(err as AxiosError, 'Failed to fetch rankings data');
      setError(errorMessage);
      
      // For 404 errors, show a helpful message about missing backend endpoints
      if (isNotFoundError(err as AxiosError)) {
        setError('This ranking feature is not available yet. The backend endpoint may not be implemented.');
        setRankingsData((prev: any) => ({
          ...prev,
          [selectedTab]: []
        }));
      } else {
        // For server errors, provide mock data as fallback
        setRankingsData((prev: any) => ({
          ...prev,
          [selectedTab]: getMockRankingsData(selectedTab)
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockRankingsData = (tab: string) => {
    switch (tab) {
      case 'attendance':
        return [
          { rank: 1, name: 'Sarah Wilson', studentCode: 'STU004', class: '11th A', attendanceRate: 98.5, presentDays: 29, totalDays: 30 },
          { rank: 2, name: 'John Doe', studentCode: 'STU001', class: '10th A', attendanceRate: 96.7, presentDays: 29, totalDays: 30 },
          { rank: 3, name: 'Jane Smith', studentCode: 'STU002', class: '10th A', attendanceRate: 95.2, presentDays: 28, totalDays: 30 },
          { rank: 4, name: 'Mike Johnson', studentCode: 'STU003', class: '10th B', attendanceRate: 93.8, presentDays: 28, totalDays: 30 },
          { rank: 5, name: 'David Brown', studentCode: 'STU005', class: '11th B', attendanceRate: 91.3, presentDays: 27, totalDays: 30 },
        ];
      case 'activities':
        return [
          { rank: 1, name: 'Jane Smith', studentCode: 'STU002', class: '10th A', totalPoints: 95, activitiesCount: 8, avgPoints: 11.9 },
          { rank: 2, name: 'John Doe', studentCode: 'STU001', class: '10th A', totalPoints: 88, activitiesCount: 7, avgPoints: 12.6 },
          { rank: 3, name: 'Sarah Wilson', studentCode: 'STU004', class: '11th A', totalPoints: 82, activitiesCount: 6, avgPoints: 13.7 },
          { rank: 4, name: 'David Brown', studentCode: 'STU005', class: '11th B', totalPoints: 79, activitiesCount: 6, avgPoints: 13.2 },
          { rank: 5, name: 'Mike Johnson', studentCode: 'STU003', class: '10th B', totalPoints: 75, activitiesCount: 5, avgPoints: 15.0 },
        ];
      default:
        return [];
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">{rank}</div>;
    }
  };

  const achievements = [
    { name: 'Perfect Attendance', description: '100% attendance for a month', icon: Trophy, color: 'text-yellow-600', count: 12 },
    { name: 'Activity Champion', description: 'Most activities in a month', icon: Medal, color: 'text-blue-600', count: 8 },
    { name: 'Consistent Performer', description: '90%+ attendance for 3 months', icon: Award, color: 'text-green-600', count: 25 },
    { name: 'Rising Star', description: 'Most improved attendance', icon: Star, color: 'text-purple-600', count: 5 },
  ];

  const tabs = [
    { id: 'attendance', name: 'Attendance Rankings', icon: TrendingUp },
    { id: 'activities', name: 'Activity Leaderboard', icon: Trophy },
    { id: 'overall', name: 'Overall Rankings', icon: Award },
  ];

  const currentRankings = rankingsData[selectedTab] || [];

  if (loading) {
    return <LoadingSpinner message="Loading rankings..." />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorBanner 
          message={error} 
          onDismiss={() => setError(null)}
          variant="warning"
        />
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rankings & Achievements</h1>
        <div className="text-sm text-gray-500">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Achievements Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div key={achievement.name} className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Icon className={`h-6 w-6 ${achievement.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{achievement.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{achievement.count}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{achievement.description}</p>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                {selectedTab === 'attendance' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present Days
                    </th>
                  </>
                )}
                {selectedTab === 'activities' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Points
                    </th>
                  </>
                )}
                {selectedTab === 'overall' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRankings.map((student: any, index: number) => (
                <tr key={student.studentCode || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(student.rank)}
                      <span className="ml-2 font-medium text-gray-900">#{student.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.studentCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.class}
                  </td>
                  {selectedTab === 'attendance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.attendanceRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.presentDays}/{student.totalDays}
                      </td>
                    </>
                  )}
                  {selectedTab === 'activities' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {student.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.activitiesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.avgPoints}
                      </td>
                    </>
                  )}
                  {selectedTab === 'overall' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.attendanceRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-purple-600">{student.overallScore}</span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rankings;