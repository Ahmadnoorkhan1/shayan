// import './App.css'
import { Route, Routes } from 'react-router'
import Homepage from './pages/Homepage'
import Faqpage from './pages/Faqpage'
import Pricingpage from './pages/Pricingpage'
import ContactUsPage from './pages/ContactUsPage'
import Authpage from './pages/Authpage'
import SignUpPage from './pages/SignUpPage'
import { Toaster } from 'react-hot-toast';
import PublicLayout from './layout/PublicLayout'
import ResetPasswordForm from './components/auth/ResetPasswordForm'
import TermsAndPrivacypage from './pages/TermsAndPrivacy'
import DashboardLayout from './layout/DashboardLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Knowledgebase from './pages/Dashboard/Knowledgebase'
import CoursecreatorPage from './pages/Dashboard/CourseCreatorPage/CoursecreatorPage'
import BookcreatorPage from './pages/Dashboard/BookCreatorPage/BookcreatorPage'
import EasyCourseCreator from './pages/Dashboard/EasyCourseCreator'
import AiCoachPage from './pages/Dashboard/AiCoach'
import EditBookCreator from './pages/Dashboard/BookCreatorPage/EditBookCreator'
import AddBookCreator from './pages/Dashboard/BookCreatorPage/AddBookCreator'
import AddCourseCreator from './pages/Dashboard/CourseCreatorPage/AddCourseCreator'
import EditCoursePage from './pages/Dashboard/CourseCreatorPage/EditCoursePage'
import SharedContent from './components/shared/SharedContent'
import GlobalLoader from './components/shared/GlobalLoader'

function App() {

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <GlobalLoader/>

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
        <Route element={<DashboardLayout/>}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard/knowledgebase' element={<Knowledgebase />} />
          <Route path='/dashboard/course-creator' element={<CoursecreatorPage />} />
          <Route path='/dashboard/course-creator/edit/:id' element={<EditCoursePage/>}/>
          {/* <Route path='/dashboard/course-creator/add' element={<AddCourseCreator/>}/> */}
          <Route path='/dashboard/course-creator/add' element={<AddCourseCreator/>}/>
          <Route path='/dashboard/book-creator' element={<BookcreatorPage />} />
          <Route path='/dashboard/book-creator/edit/:id' element={<EditBookCreator/>}/>
          <Route path='/dashboard/book-creator/add' element={<AddBookCreator/>}/>
          <Route path='/dashboard/ai-coach' element={<AiCoachPage />} />
          <Route path='/dashboard/easy-course-creator' element={<EasyCourseCreator />} />

        </Route>
        {/* <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/socials" element={<SocialsPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/store" element={<StorePage />} />
          <Route path="/dashboard/history" element={<HistoryPage />} />
          <Route path="/dashboard/news" element={<NewsPage />} />
        </Route> */}
          <Route path="/shared/:type/:id" element={<SharedContent />} />

      </Routes>
    </>
  )
}

export default App
