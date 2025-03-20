import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Loading content...</h2>
    </div>
  );
};

export default LoadingState;