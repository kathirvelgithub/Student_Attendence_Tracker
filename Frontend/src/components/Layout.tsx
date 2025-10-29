import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Activities', href: '/activities', icon: Activity },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl border-r border-gray-200">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">EduTracker</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-6 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 mb-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-xl">
        <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">EduTracker</h1>
          </div>
        </div>
        <nav className="mt-6 flex-1 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">EduTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <button 
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;