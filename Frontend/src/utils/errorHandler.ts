import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface ApiErrorResponse {
  message: string;
  errors?: any[];
  status?: number;
}

export const handleApiError = (error: AxiosError<any>, context?: string): string => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = data?.message || 'Bad request - please check your input';
        break;
      case 401:
        errorMessage = 'Unauthorized - please login again';
        break;
      case 403:
        errorMessage = 'Access forbidden - insufficient permissions';
        break;
      case 404:
        errorMessage = data?.message || 'Resource not found - this feature may not be available yet';
        break;
      case 500:
        errorMessage = 'Server error - please try again later or contact support';
        break;
      default:
        errorMessage = data?.message || `Server error (${status})`;
    }
  } else if (error.request) {
    // Network error - no response received
    errorMessage = 'Network error - please check your connection and ensure the backend server is running on port 3000';
  } else {
    // Request setup error
    errorMessage = error.message || 'Request failed';
  }
  
  // Add context if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }
  
  // Show toast notification for critical errors
  if (error.response?.status === 500) {
    toast.error('Server error detected. Please check backend logs.');
  } else if (error.response?.status === 404) {
    toast.error('Feature not available. Backend endpoint may be missing.');
  }
  
  console.error('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: errorMessage,
    fullError: error
  });
  
  return errorMessage;
};

export const isServerError = (error: AxiosError): boolean => {
  return error.response?.status === 500;
};

export const isNotFoundError = (error: AxiosError): boolean => {
  return error.response?.status === 404;
};

export const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && !!error.request;
};