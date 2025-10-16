import React from 'react';
import { X, AlertTriangle, Trash2, User, Calendar, BookOpen } from 'lucide-react';
import { Student } from '../types';
import { studentsApi } from '../services';
import { handleApiError } from '../utils/errorHandler';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface DeleteStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess: (deletedStudentId: number) => void;
}

const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({ 
  isOpen, 
  student, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState('');
  const [showFullConfirmation, setShowFullConfirmation] = React.useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setShowFullConfirmation(false);
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const expectedConfirmation = `DELETE ${student.student_id}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleDelete = async () => {
    if (!student || !isConfirmationValid) return;

    setLoading(true);
    try {
      console.log('🗑️ Attempting to delete student:', {
        id: student.id,
        name: student.name,
        student_id: student.student_id
      });
      
      const response = await studentsApi.delete(student.id);
      console.log('✅ Delete response:', response);
      
      // Show success message with more details
      toast.success(`${student.name} (ID: ${student.student_id}) has been permanently deleted from the database!`, {
        duration: 4000
      });
      
      // Call success callback to update UI
      onSuccess(student.id);
      onClose();
      
    } catch (err: any) {
      console.error('❌ Delete student error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status code:', err.response?.status);
      
      const errorMessage = handleApiError(err as AxiosError, 'Failed to delete student');
      
      if (err.response?.status === 409) {
        toast.error('Cannot delete student: Student has attendance or activity records that must be removed first', {
          duration: 6000
        });
      } else if (err.response?.status === 404) {
        toast.success('Student was already deleted from the database', {
          duration: 4000
        });
        // Still call onSuccess to remove from UI
        onSuccess(student.id);
        onClose();
      } else if (err.response?.status === 500) {
        toast.error('Database error: Unable to delete student. Please check backend logs and try again', {
          duration: 6000
        });
      } else {
        toast.error(`Deletion failed: ${errorMessage}`, {
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstConfirm = () => {
    setShowFullConfirmation(true);
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Delete Student</h2>
          </div>
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Student Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <User className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {student.name}
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Student ID: {student.student_id}
                  </div>
                  {student.class && student.section && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Class: {student.class} - Section {student.section}
                    </div>
                  )}
                  {student.email && (
                    <div className="text-sm">Email: {student.email}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">⚠️ This action cannot be undone!</p>
                  <p className="mb-2">Deleting this student will:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Permanently remove the student record</li>
                    <li>Remove associated attendance records</li>
                    <li>Remove associated activity records</li>
                    <li>Remove the student from all reports and rankings</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showFullConfirmation ? (
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <strong>{student.name}</strong>?
                </p>
                <button
                  onClick={handleFirstConfirm}
                  className="btn-danger"
                  disabled={loading}
                >
                  Yes, I want to delete this student
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  To confirm deletion, type <strong className="text-red-600">{expectedConfirmation}</strong> below:
                </p>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Type "${expectedConfirmation}" to confirm`}
                  className={`input-field mb-4 ${
                    confirmationText && !isConfirmationValid 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isConfirmationValid 
                        ? 'border-green-500 focus:ring-green-500' 
                        : ''
                  }`}
                  disabled={loading}
                  autoFocus
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-red-500 text-sm mb-4">
                    Please type exactly: {expectedConfirmation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button 
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            {showFullConfirmation && (
              <button 
                onClick={handleDelete}
                className={`btn-danger flex items-center ${
                  !isConfirmationValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading || !isConfirmationValid}
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Student
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudentModal;