import React from 'react';
import { X, Calendar, Award, User, FileText, Save } from 'lucide-react';
import { Activity, Student } from '../types';
import { activitiesApi, studentsApi } from '../services';
import { handleApiError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newActivity: Activity) => void;
}

interface FormData {
  student_id: number | '';
  activity_name: string;
  activity_type: 'academic' | 'sports' | 'cultural' | 'technical' | 'other';
  description: string;
  activity_date: string;
  points: number | '';
  status: 'participated' | 'won' | 'completed' | 'pending';
  recorded_by: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = React.useState<FormData>({
    student_id: '',
    activity_name: '',
    activity_type: 'academic',
    description: '',
    activity_date: '',
    points: '',
    status: 'participated',
    recorded_by: ''
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);

  // Load students when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadStudents();
      // Set current date as default
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, activity_date: today }));
    }
  }, [isOpen]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await studentsApi.getAll();
      if (response.data?.data?.students) {
        setStudents(response.data.data.students.filter(s => s.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.student_id) {
      newErrors.student_id = 'Student is required';
    }

    if (!formData.activity_name.trim()) {
      newErrors.activity_name = 'Activity name is required';
    } else if (formData.activity_name.trim().length < 3) {
      newErrors.activity_name = 'Activity name must be at least 3 characters';
    }

    if (!formData.activity_date) {
      newErrors.activity_date = 'Activity date is required';
    } else {
      const activityDate = new Date(formData.activity_date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (activityDate > today) {
        newErrors.activity_date = 'Activity date cannot be in the future';
      } else if (activityDate < oneYearAgo) {
        newErrors.activity_date = 'Activity date cannot be more than 1 year ago';
      }
    }

    if (formData.points === '' || formData.points === null || formData.points === undefined) {
      newErrors.points = 'Points are required';
    } else if (Number(formData.points) < 0) {
      newErrors.points = 'Points cannot be negative';
    } else if (Number(formData.points) > 100) {
      newErrors.points = 'Points cannot exceed 100';
    }

    if (!formData.recorded_by.trim()) {
      newErrors.recorded_by = 'Recorded by is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'student_id') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else if (name === 'points') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      activity_name: '',
      activity_type: 'academic',
      description: '',
      activity_date: '',
      points: '',
      status: 'participated',
      recorded_by: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const activityData = {
        student_id: Number(formData.student_id),
        activity_name: formData.activity_name.trim(),
        activity_type: formData.activity_type,
        description: formData.description.trim() || undefined,
        activity_date: formData.activity_date,
        points: Number(formData.points),
        status: formData.status,
        recorded_by: formData.recorded_by.trim()
      };

      console.log('Creating activity:', activityData);
      
      const response = await activitiesApi.create(activityData);
      if (response.data?.data?.activity) {
        toast.success('Activity added successfully!');
        onSuccess(response.data.data.activity);
        resetForm();
        onClose();
      }
    } catch (err: any) {
      console.error('Add activity error:', err);
      const errorMessage = handleApiError(err as AxiosError, 'Failed to add activity');
      
      // Handle validation errors from backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        err.response.data.errors.forEach((error: any) => {
          backendErrors[error.field] = error.message;
        });
        setErrors(backendErrors);
        toast.error('Please correct the validation errors');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Record a new student activity</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              {loadingStudents ? (
                <div className="flex items-center py-2">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  <span className="text-gray-600">Loading students...</span>
                </div>
              ) : (
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.student_id ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.student_id} ({student.class} {student.section})
                    </option>
                  ))}
                </select>
              )}
              {errors.student_id && <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>}
            </div>

            {/* Activity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Activity Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  name="activity_name"
                  value={formData.activity_name}
                  onChange={handleInputChange}
                  className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.activity_name ? 'border-red-500' : ''
                  }`}
                  placeholder="e.g., Science Fair Competition, Football Match, Drama Performance"
                  disabled={loading}
                />
                {errors.activity_name && <p className="text-red-500 text-sm mt-1">{errors.activity_name}</p>}
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type *
                </label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Activity Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Date *
                </label>
                <input
                  type="date"
                  name="activity_date"
                  value={formData.activity_date}
                  onChange={handleInputChange}
                  className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.activity_date ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.activity_date && <p className="text-red-500 text-sm mt-1">{errors.activity_date}</p>}
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.points ? 'border-red-500' : ''
                  }`}
                  placeholder="0-100"
                  disabled={loading}
                />
                {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="participated">Participated</option>
                  <option value="won">Won</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional details about the activity..."
                disabled={loading}
              />
            </div>

            {/* Recorded By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recorded By *
              </label>
              <input
                type="text"
                name="recorded_by"
                value={formData.recorded_by}
                onChange={handleInputChange}
                className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.recorded_by ? 'border-red-500' : ''
                }`}
                placeholder="Your name or staff ID"
                disabled={loading}
              />
              {errors.recorded_by && <p className="text-red-500 text-sm mt-1">{errors.recorded_by}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Adding Activity...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal;