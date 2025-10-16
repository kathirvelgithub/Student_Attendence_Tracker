import React from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Users, CreditCard } from 'lucide-react';
import { Student } from '../types';
import { studentsApi } from '../services';
import { handleApiError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  student_id: string;
  class: string;
  section: string;
  status: 'active' | 'inactive';
  date_of_birth: string;
  address: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    phone: '',
    student_id: '',
    class: '',
    section: '',
    status: 'active',
    date_of_birth: '',
    address: '',
    parent_name: '',
    parent_phone: '',
    parent_email: ''
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        student_id: '',
        class: '',
        section: '',
        status: 'active',
        date_of_birth: '',
        address: '',
        parent_name: '',
        parent_phone: '',
        parent_email: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    } else if (!/^[A-Za-z0-9]+$/.test(formData.student_id)) {
      newErrors.student_id = 'Student ID must be alphanumeric';
    }

    if (!formData.class) {
      newErrors.class = 'Class is required';
    }

    if (!formData.section) {
      newErrors.section = 'Section is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }

    // Parent phone validation
    if (formData.parent_phone && !/^\d{10,15}$/.test(formData.parent_phone.replace(/\s/g, ''))) {
      newErrors.parent_phone = 'Parent phone must be 10-15 digits';
    }

    // Parent email validation
    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      newErrors.parent_email = 'Please enter a valid parent email address';
    }

    // Date validation
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 25) {
        newErrors.date_of_birth = 'Student age should be between 5 and 25 years';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await studentsApi.create(formData);
      if (response.data?.data?.student) {
        toast.success('Student added successfully!');
        onSuccess(response.data.data.student);
        onClose();
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err as AxiosError, 'Failed to add student');
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Information Section */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter student's full name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className={`input-field ${errors.student_id ? 'border-red-500' : ''}`}
                placeholder="e.g., STU001"
                disabled={loading}
              />
              {errors.student_id && <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="student@example.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="1234567890"
                disabled={loading}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class/Grade *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className={`input-field ${errors.class ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="">Select Class</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
              </select>
              {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className={`input-field ${errors.section ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
              {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={`input-field ${errors.date_of_birth ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Address */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Enter complete address"
                disabled={loading}
              />
            </div>

            {/* Parent Information Section */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center mt-6">
                <Users className="w-5 h-5 mr-2" />
                Parent/Guardian Information
              </h3>
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent/Guardian Name
              </label>
              <input
                type="text"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter parent/guardian name"
                disabled={loading}
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent/Guardian Phone
              </label>
              <input
                type="tel"
                name="parent_phone"
                value={formData.parent_phone}
                onChange={handleInputChange}
                className={`input-field ${errors.parent_phone ? 'border-red-500' : ''}`}
                placeholder="1234567890"
                disabled={loading}
              />
              {errors.parent_phone && <p className="text-red-500 text-sm mt-1">{errors.parent_phone}</p>}
            </div>

            {/* Parent Email */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent/Guardian Email
              </label>
              <input
                type="email"
                name="parent_email"
                value={formData.parent_email}
                onChange={handleInputChange}
                className={`input-field ${errors.parent_email ? 'border-red-500' : ''}`}
                placeholder="parent@example.com"
                disabled={loading}
              />
              {errors.parent_email && <p className="text-red-500 text-sm mt-1">{errors.parent_email}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
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
                  Adding Student...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;