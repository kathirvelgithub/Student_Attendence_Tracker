import React from 'react';
import { FileX, Users, Calendar, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'file' | 'users' | 'calendar' | 'chart';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = 'file',
  action,
  className = '' 
}) => {
  const icons = {
    file: FileX,
    users: Users,
    calendar: Calendar,
    chart: BarChart3
  };

  const IconComponent = icons[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <IconComponent className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
