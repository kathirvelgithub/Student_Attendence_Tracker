import React, { useState } from 'react';
import { authApi } from '../services';

interface LoginProps {
  onLogin: (authenticated: boolean, user?: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

     try {
       // Use the authApi for login
       const response = await authApi.login({ username, password });

       if (response.data?.data?.token) {
         localStorage.setItem('token', response.data.data.token);
         localStorage.setItem('user', JSON.stringify(response.data.data.user));
         onLogin(true, response.data.data.user);
       } else {
         setError(response.data?.message || 'Invalid username or password');
       }
     } catch (err: any) {
       console.error('Login error:', err);
       // Demo fallback
       if (username === 'admin' && password === 'admin123') {
         const mockUser = { id: 1, username: 'admin', role: 'admin', full_name: 'Admin' };
         localStorage.setItem('token', 'demo-token');
         localStorage.setItem('user', JSON.stringify(mockUser));
         onLogin(true, mockUser);
       } else {
         setError('Login failed. Try admin/admin123 or check backend connection.');
       }
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">EduTracker Login</h2>
          <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <div>Demo Credentials: admin / admin123</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
