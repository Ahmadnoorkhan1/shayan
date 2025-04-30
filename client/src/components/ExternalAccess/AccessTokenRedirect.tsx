import React, { useState } from 'react';
import apiService from '../../utilities/service/api';
import { Loader2 } from 'lucide-react';

interface AccessTokenRedirectProps {
  buttonText?: string;
  className?: string;
  destinationPath?: string;
}

const AccessTokenRedirect: React.FC<AccessTokenRedirectProps> = ({ 
  buttonText = 'Access External App', 
  className = '',
  destinationPath = '/'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');


  const handleRedirect = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Initializing token generation...');
    
    try {
      // Step 1: Request preparation
      setStatus('Preparing request...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 2: Sending request to server
      setStatus('Generating secure access token...');
      // const userId = 2525
      const response = await apiService.post('/auth/generate-access-token', { 
        userId:'2525',
        destinationPath
      });

      console.log('[AccessTokenRedirect] Response:', response);
      
      // Step 3: Analyzing response
      setStatus('Processing server response...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (response.success && response?.redirectUrl) {
        // Step 4: Preparing redirect
        setStatus('Access granted! Redirecting...');
        
        // Redirect user to the external app with the token
        setTimeout(() => {
          window.location.href = response.redirectUrl;
        }, 800);
      } else {
        setError(response.message || 'Failed to generate access token');
        setStatus('');
      }
    } catch (err: any) {
      console.error('[AccessTokenRedirect] Error:', err);
      setError(err.message || 'An error occurred while generating access token');
      setStatus('');
    } finally {
      // Only set loading to false if we had an error (otherwise we're redirecting)
      if (error) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="access-token-redirect">
      {status && (
        <div className="mt-2 mb-4 text-sm text-gray-600 animate-pulse">
          {status}
        </div>
      )}
      
      <button
        onClick={handleRedirect}
        disabled={isLoading}
        className={`px-5 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          buttonText
        )}
      </button>
      
      {error && (
        <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
};

export default AccessTokenRedirect;