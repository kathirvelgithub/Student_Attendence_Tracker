import React from 'react';
import { studentsApi } from '../services';
import toast from 'react-hot-toast';

const BackendDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      
      // Test GET request
      const getResponse = await studentsApi.getAll();
      console.log('GET /students response:', getResponse);
      
      setDebugInfo({
        status: 'success',
        message: 'Backend connection successful',
        data: {
          studentsCount: getResponse.data?.data?.students?.length || 0,
          apiUrl: (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api/v1'
        }
      });
      
      toast.success('Backend connection test successful!');
      
    } catch (error: any) {
      console.error('Backend connection test failed:', error);
      setDebugInfo({
        status: 'error',
        message: 'Backend connection failed',
        error: {
          status: error.response?.status || 'No response',
          message: error.message || 'Unknown error',
          url: error.config?.url || 'Unknown URL'
        }
      });
      
      toast.error('Backend connection test failed!');
    }
  };

  const testDeleteEndpoint = async () => {
    try {
      // This will fail but helps us see what happens
      await studentsApi.delete(99999); // Non-existent ID
    } catch (error: any) {
      console.log('Delete endpoint test:', error.response?.status);
      if (error.response?.status === 404) {
        toast.success('✅ Delete endpoint is working correctly! (404 for non-existent ID is expected)');
        setDebugInfo({
          status: 'success',
          message: 'Delete endpoint working correctly',
          details: 'Returned 404 for non-existent student ID - this is the correct behavior'
        });
      } else if (error.response?.status === 405) {
        toast.error('❌ Delete endpoint not implemented (Method Not Allowed)');
        setDebugInfo({
          status: 'error',
          message: 'Delete endpoint not implemented',
          details: 'Backend needs DELETE route for /api/v1/students/:id'
        });
      } else {
        toast.error(`❌ Delete endpoint issue: ${error.response?.status || 'No response'}`);
        setDebugInfo({
          status: 'error',
          message: 'Delete endpoint issue',
          details: `Status: ${error.response?.status}, Message: ${error.message}`
        });
      }
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">Backend Debugger</h3>
      
      <div className="flex gap-3 mb-4">
        <button 
          onClick={testBackendConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Backend Connection
        </button>
        
        <button 
          onClick={testDeleteEndpoint}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Delete Endpoint
        </button>
      </div>
      
      {debugInfo && (
        <div className="bg-white border rounded p-3">
          <h4 className="font-semibold mb-2">Debug Results:</h4>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <p className="text-sm text-yellow-700 mt-3">
        🔧 Use this to debug backend connection issues. Check browser console for detailed logs.
      </p>
    </div>
  );
};

export default BackendDebugger;