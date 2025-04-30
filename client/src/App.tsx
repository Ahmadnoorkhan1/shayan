import  { useEffect, useState } from 'react';
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
import AudioCreator from './components/AudioCreator';
import OnboardingFlow from './pages/onboardingFlow/OnboardingFlow';
import ContentGenerationStepper from './pages/onboarding/ContentGenerationStepper';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
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
      
      // Fix: JSON stringify the object before storing
      if (userData.userData) {
        localStorage.setItem('userData', JSON.stringify(userData.userData));
        console.log(userData, "=======================>one")
      } else {
        // If the userData structure is different (flat structure)
        const userDataToStore = {
          id: userData.id || userData.userId,
          email: userData.email
        };
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
        // localStorage.setItem("onBoardingCompleted", userData.userData.onboarding_completed)

        console.log(userDataToStore, "=======================>two")
      }
      
      // Also store the user ID directly for easier access
      const userId = userData.userData?.id || userData.id || userData.userData?.user_id || userData.userId;
      if (userId) {
        localStorage.setItem('userId', userId.toString());
      }
    }
    
    // Store email for welcome banner (adjust path according to your structure)
    setWelcomeEmail(userData?.userData?.email || userData?.email || '');
    
    // Rest of your code remains the same
    const redirectPath =   userData?.userData?.onBoardingCompleted ? "/dashboard" :  '/onboard';
    console.log(`[App] Redirecting to: ${redirectPath}`);
    
    navigate(redirectPath, { replace: true });
    
    
    
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
          <Route element={<ProtectedRoute />}>
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
              <Route path="/create-audio/:contentType/:id" element={<AudioCreator />} />
          <Route path="/onboard" element={<OnboardingFlow />} />
          <Route path="/create" element={<ContentGenerationStepper />} />
          <Route path="/create/:contentType" element={<ContentGenerationStepper />} />
            </Route>
          </Route>

          {/* Other routes */}
          <Route path="/shared/:type/:id" element={<SharedContent />} />
         
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