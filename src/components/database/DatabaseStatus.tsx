import React, { useState, useEffect } from "react";
import { apiService, isUsingPostgreSQL } from "../../services/apiService";

interface DatabaseStatusProps {
  className?: string;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  className = "",
}) => {
  const [status, setStatus] = useState<{
    mode: string;
    connected: boolean;
    loading: boolean;
    error?: string;
  }>({
    mode: apiService.getCurrentMode(),
    connected: false,
    loading: true,
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus((prev) => ({ ...prev, loading: true, error: undefined }));
        const connected = await apiService.testConnection();
        setStatus((prev) => ({ ...prev, connected, loading: false }));
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          connected: false,
          loading: false,
          error: error instanceof Error ? error.message : "Connection failed",
        }));
      }
    };

    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (status.loading) return "text-yellow-600";
    if (status.connected) return "text-green-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (status.loading) return "⏳";
    if (status.connected) return "✅";
    return "❌";
  };

  const getStatusText = () => {
    if (status.loading) return "Checking connection...";
    if (status.connected) return "Connected";
    return "Disconnected";
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Database Status</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Mode:</span>
          <span className="font-medium">
            {status.mode}
            {isUsingPostgreSQL() && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Production
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span
            className={`font-medium flex items-center gap-1 ${getStatusColor()}`}
          >
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>

        {status.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">
              <strong>Error:</strong> {status.error}
            </p>
          </div>
        )}

        {!isUsingPostgreSQL() && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Currently using mock data. Set{" "}
              <code>USE_POSTGRES=true</code> in .env to use PostgreSQL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;
