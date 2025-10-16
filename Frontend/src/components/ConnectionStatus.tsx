import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      setIsConnected(response.ok && data.success);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
        Checking connection...
      </div>
    );
  }

  return (
    <div className={`flex items-center text-sm ${isConnected ? 'text-green-600' : 'text-amber-600'}`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 mr-2" />
          Connected to Backend
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-2" />
          Demo Mode (Backend Offline)
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;