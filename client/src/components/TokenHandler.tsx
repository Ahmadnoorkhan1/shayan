import React, { useEffect, useState } from 'react';
import apiService from '../utilities/service/api';

interface TokenHandlerProps {
  token: string | null;
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
  verificationStep?: string;
}

const TokenHandler: React.FC<TokenHandlerProps> = ({ token, onSuccess, onError, verificationStep }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Initializing verification process...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No token provided');
      onError('No token provided');
      return;
    }

    // Simulate progress intervals
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    // Verification steps with deliberate delays for visibility
    const verifyToken = async () => {
      try {
        console.log('[TokenHandler] Starting verification process');
        
        // Step 1: Pre-verification delay
        setMessage('Preparing to verify token...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 2: Sending verification request
        setMessage('Contacting authentication server...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 3: Making the actual API call
        setMessage('Verifying token validity...');
        const response = await apiService.post('/auth/verify-access-token', { token });
        
        // Step 4: Processing response with delay
        setMessage('Processing authentication response...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Final status update
        if (response.success) {
          setProgress(100);
          setStatus('success');
          setMessage('Authentication successful!');
          
          // Success callback with delay for better UX
          setTimeout(() => {
            onSuccess(response);
          }, 1000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Token verification failed');
          setTimeout(() => {
            onError(response.message || 'Token verification failed');
          }, 1000);
        }
      } catch (error: any) {
        console.error('[TokenHandler] Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while verifying token');
        
        setTimeout(() => {
          onError(error.message || 'An error occurred while verifying token');
        }, 1000);
      } finally {
        clearInterval(progressInterval);
      }
    };

    // Start verification with slight delay
    setTimeout(() => {
      verifyToken();
    }, 300);

    return () => {
      clearInterval(progressInterval);
    };
  }, [token, onSuccess, onError]);

  // Update message if an external step is provided
  useEffect(() => {
    if (verificationStep) {
      setMessage(verificationStep);
    }
  }, [verificationStep]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="mb-6">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mb-6 text-green-500 animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mb-6 text-red-500 animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <h2 className={`text-2xl font-bold ${
          status === 'success' ? 'text-green-600' : 
          status === 'error' ? 'text-red-600' : 'text-purple-600'
        } mb-3`}>
          {status === 'verifying' ? 'Verifying Access' : 
           status === 'success' ? 'Access Granted' : 'Access Denied'}
        </h2>
        
        <p className="text-gray-600 text-lg mb-4">{message}</p>
        
        {/* Progress bar for verification */}
        {status === 'verifying' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenHandler;