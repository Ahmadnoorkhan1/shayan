import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed to load content</h2>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default ErrorState;