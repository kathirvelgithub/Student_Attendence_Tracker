import React from 'react';
import { Plus, Search, Award, Calendar, Filter } from 'lucide-react';
import { Activity } from '../types';
import { activitiesApi } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import AddActivityModal from '../components/AddActivityModal';
import { handleApiError, isServerError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const Activities: React.FC = () => {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // Fetch activities from API
  React.useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activitiesApi.getAll();
      console.log('Activities API Response:', response.data);
      
      // Backend returns: { success: true, data: { activities: [...], pagination: {...} } }
      const activitiesData = response.data?.data?.activities || [];
      
      console.log('Processed activities:', activitiesData);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err: any) {
      console.error('Activities fetch error:', err);
      const errorMessage = handleApiError(err as AxiosError, 'Failed to fetch activities');
      setError(errorMessage);
      
      // Only use fallback data for server errors or network issues
      if (isServerError(err as AxiosError) || !err.response) {
        console.log('Using mock data due to server error');
        setActivities(getMockActivities());
      } else {
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    toast.success('Activity added successfully!');
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  const getMockActivities = (): Activity[] => [
    {
      id: 1,
      student_id: 1,
      activity_name: 'Science Fair',
      activity_type: 'academic',
      description: 'Participated in school science fair with project on renewable energy',
      activity_date: '2024-01-10',
      points: 15,
      status: 'participated',
      recorded_by: 'Teacher A',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z',
      name: 'John Doe',
      student_code: 'STU001',
      class: '10th Grade',
      section: 'A'
    },
    {
      id: 2,
      student_id: 2,
      activity_name: 'Basketball Tournament',
      activity_type: 'sports',
      description: 'Won inter-class basketball tournament',
      activity_date: '2024-01-12',
      points: 25,
      status: 'won',
      recorded_by: 'Sports Teacher',
      created_at: '2024-01-12T10:00:00Z',
      updated_at: '2024-01-12T10:00:00Z',
      name: 'Jane Smith',
      student_code: 'STU002',
      class: '10th Grade',
      section: 'A'
    },
    {
      id: 3,
      student_id: 3,
      activity_name: 'Coding Contest',
      activity_type: 'technical',
      description: 'Participated in programming contest',
      activity_date: '2024-01-15',
      points: 20,
      status: 'completed',
      recorded_by: 'CS Teacher',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      name: 'Mike Johnson',
      student_code: 'STU003',
      class: '10th Grade',
      section: 'B'
    },
  ];

  const filteredActivities = activities.filter(activity => {
    if (!activity) return false;
    
    const matchesSearch = activity.activity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;
    const matchesType = !selectedType || activity.activity_type === selectedType;
    const matchesStatus = !selectedStatus || activity.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'activity-academic';
      case 'sports': return 'activity-sports';
      case 'cultural': return 'activity-cultural';
      case 'technical': return 'activity-technical';
      default: return 'activity-other';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'participated': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading activities..." />;
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
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <button 
          className="btn-primary flex items-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search activities..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>
          <select 
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="participated">Participated</option>
            <option value="won">Won</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <button className="btn-secondary flex items-center justify-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getActivityTypeColor(activity.activity_type)
                }`}>
                  {activity.activity_type}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getStatusColor(activity.status)
              }`}>
                {activity.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activity.activity_name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {activity.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Student:</span>
                <span className="font-medium">{activity.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Points:</span>
                <span className="font-bold text-blue-600">{activity.points || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Recorded by:</span>
                <span>{activity.recorded_by || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && !loading && (
        <EmptyState
          title="No activities found"
          description="There are no activities to display. Try adjusting your filters or add a new activity."
          icon="chart"
          action={{
            label: "Add Activity",
            onClick: () => setIsAddModalOpen(true)
          }}
        />
      )}

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddActivity}
      />
    </div>
  );
};

export default Activities;