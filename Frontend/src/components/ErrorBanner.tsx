import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message, 
  onDismiss,
  variant = 'error',
  className = '' 
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 mt-0.5 mr-3 ${iconClasses[variant]}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 p-1 rounded-md hover:bg-opacity-20 hover:bg-gray-500 ${iconClasses[variant]}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
