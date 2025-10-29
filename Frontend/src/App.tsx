import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Activities from './pages/Activities';
import Login from './pages/Login';
import socketService from './services/socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Connect to socket when authenticated
  socketService.connect();
        
        console.log('🔐 User authenticated:', parsedUser.username);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = React.useCallback((authenticated: boolean, userData?: any) => {
    setIsAuthenticated(authenticated);
    if (authenticated && userData) {
      setUser(userData);
      // Connect to socket on successful login
  socketService.connect();
    }
  }, []);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Disconnect socket on logout
  socketService.disconnect();
    
    console.log('👋 User logged out');
  }, []);

  // Cleanup socket connection on unmount
  React.useEffect(() => {
    return () => {
  socketService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Loading EduTracker...</h2>
          <p className="text-gray-500">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              fontWeight: '500',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Layout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;