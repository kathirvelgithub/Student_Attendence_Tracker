import React, { useState } from 'react';
import { studentsApi, attendanceApi, activitiesApi, reportsApi, streaksApi } from '../services';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  statusCode?: number;
  message: string;
  responseTime?: number;
}

export const BackendEndpointTester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const backendUrl = 'https://student-attendence-tracker.onrender.com';

  const updateResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const testEndpoint = async (
    name: string,
    endpoint: string,
    method: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await testFn();
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint: name,
        method,
        status: 'success',
        statusCode: response.status,
        message: `✅ Success - ${response.data?.message || 'OK'}`,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = error.response?.status;
      
      // 401 is expected for protected routes without auth
      if (statusCode === 401) {
        return {
          endpoint: name,
          method,
          status: 'warning',
          statusCode,
          message: '⚠️ Authentication required (endpoint works)',
          responseTime
        };
      }
      
      return {
        endpoint: name,
        method,
        status: 'error',
        statusCode,
        message: `❌ ${error.message} - ${error.response?.data?.message || 'Failed'}`,
        responseTime
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    setProgress(0);

    const tests = [
      // Backend Health Check
      {
        name: 'Backend Health',
        endpoint: '/',
        method: 'GET',
        fn: () => fetch(`${backendUrl}`).then(r => ({ status: r.status, data: {} }))
      },
      
      // Students API
      {
        name: 'GET /api/v1/students',
        endpoint: '/api/v1/students',
        method: 'GET',
        fn: () => studentsApi.getAll()
      },
      {
        name: 'GET /api/v1/students/1',
        endpoint: '/api/v1/students/:id',
        method: 'GET',
        fn: () => studentsApi.getById(1)
      },
      
      // Attendance API
      {
        name: 'GET /api/v1/attendance',
        endpoint: '/api/v1/attendance',
        method: 'GET',
        fn: () => attendanceApi.getAll()
      },
      {
        name: 'GET /api/v1/attendance/date',
        endpoint: '/api/v1/attendance/date/:date',
        method: 'GET',
        fn: () => attendanceApi.getByDate('2025-10-29')
      },
      
      // Activities API
      {
        name: 'GET /api/v1/activities',
        endpoint: '/api/v1/activities',
        method: 'GET',
        fn: () => activitiesApi.getAll()
      },
      {
        name: 'GET /api/v1/activities/statistics',
        endpoint: '/api/v1/activities/statistics',
        method: 'GET',
        fn: () => activitiesApi.getStatistics()
      },
      {
        name: 'GET /api/v1/activities/1',
        endpoint: '/api/v1/activities/:id',
        method: 'GET',
        fn: () => activitiesApi.getById(1)
      },
      
      // Reports API
      {
        name: 'GET /api/v1/reports/attendance',
        endpoint: '/api/v1/reports/attendance',
        method: 'GET',
        fn: () => reportsApi.getAttendanceReport({})
      },
      {
        name: 'GET /api/v1/reports/activities',
        endpoint: '/api/v1/reports/activities',
        method: 'GET',
        fn: () => reportsApi.getActivityReport({})
      },
      {
        name: 'GET /api/v1/reports/summary',
        endpoint: '/api/v1/reports/summary',
        method: 'GET',
        fn: () => reportsApi.getSummaryReport({})
      },
      
      // Streaks API
      {
        name: 'GET /api/v1/streaks',
        endpoint: '/api/v1/streaks',
        method: 'GET',
        fn: () => streaksApi.getAll()
      },
      {
        name: 'GET /api/v1/streaks/top',
        endpoint: '/api/v1/streaks/top',
        method: 'GET',
        fn: () => streaksApi.getTopStreaks(10)
      },
    ];

    const totalTests = tests.length;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await testEndpoint(test.name, test.endpoint, test.method, test.fn);
      updateResult(result);
      setProgress(((i + 1) / totalTests) * 100);
      
      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔌 Backend API Endpoint Tester
        </h2>
        <p className="text-gray-600">
          Testing all endpoints at: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{backendUrl}</code>
        </p>
      </div>

      <button
        onClick={runAllTests}
        disabled={testing}
        className="w-full mb-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {testing ? (
          <span className="flex items-center justify-center">
            <Clock className="w-5 h-5 mr-2 animate-spin" />
            Testing Endpoints... {Math.round(progress)}%
          </span>
        ) : (
          '🚀 Test All Endpoints'
        )}
      </button>

      {testing && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Success</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-yellow-700">Auth Required</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm font-semibold bg-white px-2 py-1 rounded">
                          {result.method}
                        </span>
                        <span className="font-medium text-gray-900">
                          {result.endpoint}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{result.message}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {result.statusCode && (
                      <div className="text-sm font-mono font-semibold text-gray-700">
                        {result.statusCode}
                      </div>
                    )}
                    {result.responseTime && (
                      <div className="text-xs text-gray-500">
                        {result.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Notes:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>Success (200-299):</strong> Endpoint working correctly</li>
          <li>⚠️ <strong>Warning (401):</strong> Endpoint exists but requires authentication</li>
          <li>❌ <strong>Error (4xx, 5xx):</strong> Endpoint failed or not found</li>
          <li>🔒 Most endpoints require JWT authentication for full access</li>
        </ul>
      </div>
    </div>
  );
};
