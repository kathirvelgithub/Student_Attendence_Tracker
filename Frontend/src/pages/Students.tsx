import React from 'react';
import { Plus, Search, Edit, Trash2, Eye, AlertTriangle, UserPlus, RefreshCw, X } from 'lucide-react';
import { Student } from '../types';
import { studentsApi } from '../services';
import { handleApiError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import AddStudentModal from '../components/AddStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import DeleteStudentModal from '../components/DeleteStudentModal';
import StudentDetailsModal from '../components/StudentDetailsModal';

const Students: React.FC = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [classFilter, setClassFilter] = React.useState('');
  const [sectionFilter, setSectionFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  // Fetch students from API
  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getAll({
        search: searchTerm || undefined
      });
      if (response.data?.data?.students) {
        setStudents(response.data.data.students);
        setRetryCount(0); // Reset retry count on success
        if (showToast) {
          toast.success('Students loaded successfully');
        }
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err as AxiosError, 'Failed to fetch students');
      setError(errorMessage);
      setStudents([]); // Always show empty state on error
      
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    fetchStudents(true);
  };

  // Improved search functionality with debouncing
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  // Debounce search term
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Refetch when debounced search term changes (for server-side search if needed)
  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only fetch when debounced
    
    const timeoutId = setTimeout(() => {
      if (!loading && debouncedSearchTerm) {
        // For server-side search, uncomment the line below
        // fetchStudents();
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [debouncedSearchTerm]);

  // Improved client-side filtering with all filters
  const filteredStudents = React.useMemo(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => {
        const name = student.name?.toLowerCase() || '';
        const email = student.email?.toLowerCase() || '';
        const studentId = student.student_id?.toLowerCase() || '';
        const className = student.class?.toLowerCase() || '';
        const section = student.section?.toLowerCase() || '';
        const phone = student.phone?.toLowerCase() || '';
        
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          studentId.includes(searchLower) ||
          className.includes(searchLower) ||
          section.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }
    
    // Apply class filter
    if (classFilter) {
      filtered = filtered.filter(student => student.class === classFilter);
    }
    
    // Apply section filter
    if (sectionFilter) {
      filtered = filtered.filter(student => student.section === sectionFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    
    return filtered;
  }, [students, searchTerm, classFilter, sectionFilter, statusFilter]);

  // Action handlers
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowAddModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    toast.success(`${newStudent.name} has been added successfully!`);
  };

  const handleStudentUpdated = (updatedStudent: Student) => {
    setStudents(prev => prev.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
    toast.success(`${updatedStudent.name} has been updated successfully!`);
  };

  const handleStudentDeleted = async (deletedStudentId: number) => {
    // Immediately remove from UI
    setStudents(prev => prev.filter(student => student.id !== deletedStudentId));
    
    // Force refresh from server to ensure consistency
    try {
      setRefreshing(true);
      console.log('Refreshing student list after deletion...');
      await fetchStudents(false);
      console.log('Student list refreshed successfully');
      toast.success('Student list updated from database', { duration: 2000 });
    } catch (error) {
      console.error('Failed to refresh student list:', error);
      toast.error('Student deleted but failed to refresh list. Please refresh manually.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && students.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <button onClick={handleAddStudent} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
        
        <div className="card">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Students
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={retryFetch}
                className="btn-primary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry {retryCount > 0 && `(${retryCount})`}
              </button>
              <button 
                onClick={handleAddStudent}
                className="btn-secondary flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Student
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">
            {refreshing ? (
              <span className="text-blue-600">
                <RefreshCw className="inline w-4 h-4 animate-spin mr-1" />
                Updating student list...
              </span>
            ) : (
              <>
                {students.length > 0 ? `${students.length} student${students.length !== 1 ? 's' : ''} found` : 'Manage student information'}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchStudents(true)}
            className="btn-secondary flex items-center"
            disabled={loading || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={handleAddStudent}
            className="btn-primary flex items-center"
            disabled={loading || refreshing}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, student ID, class, section, or phone..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select 
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setClassFilter('');
                  setSectionFilter('');
                  setStatusFilter('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Clear all filters"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Filter Results Summary */}
          {(searchTerm || classFilter || sectionFilter || statusFilter) && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">
                Showing {filteredStudents.length} of {students.length} students
                {filteredStudents.length === 0 && ' - try adjusting your filters'}
                {refreshing && (
                  <span className="ml-2 text-blue-600">
                    <RefreshCw className="inline w-3 h-3 animate-spin mr-1" />
                    Updating...
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                {searchTerm && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Search: "{searchTerm}"
                  </span>
                )}
                {classFilter && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Class: {classFilter}
                  </span>
                )}
                {sectionFilter && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Section: {sectionFilter}
                  </span>
                )}
                {statusFilter && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Status: {statusFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class & Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.class} - {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleViewStudent(student)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditStudent(student)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Edit Student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && students.length === 0 && !error && (
          <div className="text-center py-16">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Students Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Get started by adding your first student to the system.
            </p>
            <button 
              onClick={handleAddStudent}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Student
            </button>
          </div>
        )}
        
        {filteredStudents.length === 0 && students.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No students match your search
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setClassFilter('');
                setSectionFilter('');
                setStatusFilter('');
              }}
              className="btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredStudents.length} of {students.length} students
        </div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleStudentAdded}
      />

      {showEditModal && selectedStudent && (
        <EditStudentModal
          isOpen={showEditModal}
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleStudentUpdated}
        />
      )}

      {/* Delete Student Modal */}
      <DeleteStudentModal
        isOpen={showDeleteModal}
        student={selectedStudent}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleStudentDeleted}
      />

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={showDetailsModal}
        student={selectedStudent}
        onClose={() => setShowDetailsModal(false)}
        onEdit={handleEditStudent}
      />
    </div>
  );
};

export default Students;