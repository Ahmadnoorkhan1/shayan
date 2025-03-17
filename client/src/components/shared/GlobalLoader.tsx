import React, { useEffect, useState } from 'react';
import { Loader2, RotateCw } from 'lucide-react'; // Import Lucide React icons

interface LoaderState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'bar' | 'spinner' | 'dots';
}

const GlobalLoader = () => {
  const [loaderState, setLoaderState] = useState<LoaderState>({
    isLoading: localStorage.getItem('isLoading') === 'true',
    message: localStorage.getItem('loadingMessage') || 'Loading...',
    progress: parseInt(localStorage.getItem('loadingProgress') || '0'),
    type: (localStorage.getItem('loaderType') as 'bar' | 'spinner' | 'dots') || 'bar'
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setLoaderState({
        isLoading: localStorage.getItem('isLoading') === 'true',
        message: localStorage.getItem('loadingMessage') || 'Loading...',
        progress: parseInt(localStorage.getItem('loadingProgress') || '0'),
        type: (localStorage.getItem('loaderType') as 'bar' | 'spinner' | 'dots') || 'bar'
      });
    };

    window.addEventListener('loadingStatusChanged', handleStorageChange);
    return () => {
      window.removeEventListener('loadingStatusChanged', handleStorageChange);
    };
  }, []);

  if (!loaderState.isLoading) return null;

  return (
    <>
      {/* Progress Bar Loader (top of screen) */}
      {loaderState.type === 'bar' && (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-primary to-purple-700 animate-pulse-gradient" 
            style={{ 
              width: loaderState.progress ? `${loaderState.progress}%` : 'auto',
              animation: !loaderState.progress ? 'loader 1s ease-in-out infinite' : 'none'
            }}
          />
        </div>
      )}

      {/* Spinner or Dots Overlay */}
      {(loaderState.type === 'spinner' || loaderState.type === 'dots') && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            {loaderState.type === 'spinner' ? (
              <div className="relative">
                {/* Spinner Background */}
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                {/* Spinner Foreground */}
                <div className="w-16 h-16 rounded-full border-4 border-t-primary border-l-primary absolute top-0 animate-spin"></div>
                {/* Pulsing Dot */}
                <div className="absolute top-0 right-2 w-3 h-3 bg-gradient-to-br from-primary to-purple-700 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            
            {/* Message Text */}
            <p className="text-gray-800 mt-4 font-medium text-center">{loaderState.message}</p>
            
            {/* Progress Text (if available) */}
            {loaderState.progress as any > 0 && (
              <div className="mt-2 w-full">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${loaderState.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{loaderState.progress}% complete</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalLoader;