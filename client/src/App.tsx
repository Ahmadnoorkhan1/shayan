import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';
import Homepage from './pages/Homepage';
import Faqpage from './pages/Faqpage';
import Pricingpage from './pages/Pricingpage';
import ContactUsPage from './pages/ContactUsPage';
import Authpage from './pages/Authpage';
import SignUpPage from './pages/SignUpPage';
import { Toaster } from 'react-hot-toast';
import PublicLayout from './layout/PublicLayout';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import TermsAndPrivacypage from './pages/TermsAndPrivacy';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Knowledgebase from './pages/Dashboard/Knowledgebase';
import CoursecreatorPage from './pages/Dashboard/CourseCreatorPage/CoursecreatorPage';
import BookcreatorPage from './pages/Dashboard/BookCreatorPage/BookcreatorPage';
import EasyCourseCreator from './pages/Dashboard/EasyCourseCreator';
import AiCoachPage from './pages/Dashboard/AiCoach';
import EditBookCreator from './pages/Dashboard/BookCreatorPage/EditBookCreator';
import AddBookCreator from './pages/Dashboard/BookCreatorPage/AddBookCreator';
import AddCourseCreator from './pages/Dashboard/CourseCreatorPage/AddCourseCreator';
import EditCoursePage from './pages/Dashboard/CourseCreatorPage/EditCoursePage';
import SharedContent from './components/shared/SharedContent';
import GlobalLoader from './components/shared/GlobalLoader';
import Home from './pages/onboarding/Home';
import './App.css';
import TokenHandler from './components/TokenHandler';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [welcomeEmail, setWelcomeEmail] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check for token in URL on component mount or URL change
  useEffect(() => {
    const checkForToken = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get('token');
      
      // Log for debugging
      console.log('[App] URL check: token exists?', !!urlToken);
      
      if (urlToken) {
        // Capture token and trigger verification process
        setToken(urlToken);
        setIsProcessingToken(true);
        
        // Remove token from URL for security
        // setTimeout(() => {
        //   const cleanUrl = window.location.pathname + 
        //     (queryParams.toString() ? '?' + 
        //       Array.from(queryParams.entries())
        //         .filter(([key]) => key !== 'token')
        //         .map(([key, value]) => `${key}=${value}`)
        //         .join('&') : '');
                
        //   window.history.replaceState({}, document.title, cleanUrl);
        //   console.log('[App] URL cleaned, token removed from address bar');
        // }, 300);
      }
    };
    
    checkForToken();
  }, [location.search]); // Re-run when URL changes

  // Handle successful authentication
  useEffect(() => {
    if (userData) {
      console.log('[App] User authenticated:', userData);
      
      // Store auth data if needed
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
      
      // Store email for welcome banner
      setWelcomeEmail(userData?.userData?.email || '');
      
      // Get the redirect URL from userData or use dashboard as default
      const redirectPath = '/onboard';
      console.log(`[App] Redirecting to: ${redirectPath}`);
      
      // Navigate to the specified path (using replace to avoid back button issues)
      navigate(redirectPath, { replace: true });
      
      // Show welcome banner
      setShowWelcomeBanner(true);
      
      // Auto-hide welcome banner after 5 seconds
      setTimeout(() => {
        setShowWelcomeBanner(false);
      }, 8000);
      
      // Reset userData to prevent duplicate effects
      setUserData(null);
    }
  }, [userData, navigate]);

  // Handle verification success
  const handleVerificationSuccess = (data: any) => {
    console.log('[App] Token verification successful:', data);
    setUserData(data);
    setIsProcessingToken(false);
  };
  
  // Handle verification failure
  const handleVerificationError = (errorMsg: string) => {
    console.error('[App] Token verification failed:', errorMsg);
    setError(errorMsg);
    setIsProcessingToken(false);
  };

  return (
    <div className="App">
      <Toaster position="bottom-center" reverseOrder={false} />
      <GlobalLoader />

      {/* Welcome Banner */}
      {/* Welcome Modal */}
{showWelcomeBanner && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-scaleIn">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-3 text-purple-600 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl text-white font-bold">Welcome to MiniSchools Academy!</h2>
            {welcomeEmail && (
              <p className="text-purple-100 mt-1">
                You're signed in as <span className="font-medium">{welcomeEmail}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Your Creative Journey Starts Here
        </h3>
        <p className="text-gray-600 mb-4">
          Transform your ideas into engaging educational content with our powerful AI-powered tools.
        </p>
        
        {/* Features */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Book Creator</h4>
              <p className="text-sm text-gray-600">Create professional educational books with AI assistance</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Course Creator</h4>
              <p className="text-sm text-gray-600">Design structured courses with interactive content</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Easy Course Creator</h4>
              <p className="text-sm text-gray-600">Generate complete courses in just one click</p>
            </div>
          </div>
        </div>
        
      
      </div>
      
     
    </div>
  </div>
)}

      {/* Token verification process */}
      {isProcessingToken && (
        <TokenHandler
          token={token}
          onSuccess={handleVerificationSuccess}
          onError={handleVerificationError}
        />
      )}
      
      {/* Regular app content */}
      {!isProcessingToken && (
        <Routes>
          {/* Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/faq" element={<Faqpage />} />
            <Route path="/pricing" element={<Pricingpage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/login" element={<Authpage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/terms-and-privacy" element={<TermsAndPrivacypage />} />
          </Route>

          {/* Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/dashboard/knowledgebase' element={<Knowledgebase />} />
            <Route path='/dashboard/course-creator' element={<CoursecreatorPage />} />
            <Route path='/dashboard/course-creator/edit/:id' element={<EditCoursePage />} />
            <Route path='/dashboard/course-creator/add' element={<AddCourseCreator />} />
            <Route path='/dashboard/book-creator' element={<BookcreatorPage />} />
            <Route path='/dashboard/book-creator/edit/:id' element={<EditBookCreator />} />
            <Route path='/dashboard/book-creator/add' element={<AddBookCreator />} />
            <Route path='/dashboard/ai-coach' element={<AiCoachPage />} />
            <Route path='/dashboard/easy-course-creator' element={<EasyCourseCreator />} />
          </Route>

          <Route path="/shared/:type/:id" element={<SharedContent />} />
          <Route path="/preview/:type/:id" element={<SharedContent />} />

          <Route path="/onboard" element={<Home />} />
        </Routes>
      )}
      
      {/* Error UI if token verification fails */}
      {!isProcessingToken && error && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl text-center">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Token Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  setError(null);
                  navigate('/');
                }} 
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;