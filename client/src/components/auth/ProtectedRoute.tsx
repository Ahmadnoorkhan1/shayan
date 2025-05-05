import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import apiService from '../../utilities/service/api';
import toast from 'react-hot-toast';

// Session cache constants
const SESSION_CACHE_KEY = 'auth_session_verified';
const SESSION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const ProtectedRoute = () => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      // If no token exists, redirect to login
      if (!token) {
        setAuthState('unauthenticated');
        return;
      }

      // Check if we have a valid session cache
      const sessionCache = JSON.parse(localStorage.getItem(SESSION_CACHE_KEY) || '{}');
      const now = Date.now();
      
      // If we have a recent valid session verification, skip verification
      if (
        sessionCache.token === token && 
        sessionCache.timestamp && 
        now - sessionCache.timestamp < SESSION_CACHE_DURATION
      ) {
        console.log('Using cached session verification');
        setAuthState('authenticated');
        return;
      }
      
      try {
        // Verify token with backend
        const response = await apiService.post('/auth/verify-access-token', {
          token
        });
        
        if (response.success) {
          // Cache the successful verification
          localStorage.setItem(
            SESSION_CACHE_KEY, 
            JSON.stringify({ 
              token, 
              timestamp: now 
            })
          );
          
          setAuthState('authenticated');
        } else {
          // Handle unsuccessful verification but valid response
          localStorage.removeItem('authToken');
          localStorage.removeItem(SESSION_CACHE_KEY);
          setAuthState('unauthenticated');
          setErrorMessage(response.message || 'Your session has expired. Please login again.');
        }
      } catch (error: any) {
        // Handle errors
        localStorage.removeItem('authToken');
        localStorage.removeItem(SESSION_CACHE_KEY);
        setAuthState('unauthenticated');
        
        if (error.response) {
          // Handle specific HTTP error codes
          if (error.response.status === 401) {
            setErrorMessage('Your session has expired. Please login again.');
          } else if (error.response.status === 403) {
            setErrorMessage('You do not have permission to access this resource.');
          } else {
            setErrorMessage('Authentication error. Please login again.');
          }
        } else {
          setErrorMessage('Network error. Please check your connection and try again.');
        }
      }
    };
    
    verifyAuth();
  }, []);

  // Show loading state while checking authentication
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your session</h2>
          <p className="text-gray-600">Please wait while we authenticate your access...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the child routes
  if (authState === 'authenticated') {
    return <Outlet />;
  }

  // If not authenticated with error, show error message and then redirect
  if (errorMessage) {
    toast.error(errorMessage);
  }

  // Redirect to login
  return <ExternalRedirect />
};

// Export a function to clear the session cache (useful for logout)
export const clearAuthSessionCache = () => {
  localStorage.removeItem(SESSION_CACHE_KEY);
};


const ExternalRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://minilessonsacademy.com/react-access.php';
  }, []);

  return null; // or a loader/spinner
};


export default ProtectedRoute;