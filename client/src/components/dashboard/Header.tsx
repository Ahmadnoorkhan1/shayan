import React from 'react';
import { Button } from '../ui/button';
import { User } from 'lucide-react';
import { useLocation } from 'react-router';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const path = location.pathname;

  const getHeaderTitle = () => {
    // Check if path includes specific route patterns
    if (path === '/dashboard') {
      return 'Dashboard';
    } else if (path.includes('/dashboard/course-creator')) {
      if (path.includes('/edit/')) {
        return 'Edit Course';
      } else if (path.includes('/add')) {
        return 'New Course';
      } else {
        return 'Course Creator';
      }
    } else if (path.includes('/dashboard/book-creator')) {
      if (path.includes('/edit/')) {
        return 'Edit Book';
      } else if (path.includes('/add')) {
        return 'New Book';
      } else {
        return 'Book Creator';
      }
    } else if (path.includes('/dashboard/ai-coach')) {
      return 'AI Coach';
    } else if (path.includes('/dashboard/easy-course-creator')) {
      return 'Easy Course Creator';
    } else if (path.includes('/dashboard/knowledgebase')) {
      return 'Knowledge Base';
    }
    
    // Default fallback
    return 'Dashboard';
  };

  return (
    <header className="col-span-full md:col-start-2 bg-white shadow-md p-4 flex items-center justify-between">
      <button className="btn btn-sm md:hidden flex" onClick={toggleSidebar}>
        <img
          src="/images/icons/hamburger.svg"
          alt="hamburger"
          width={25}
          height={25}
        />
      </button>
      
      {/* Dynamic title with gradient styling */}
      <h1 className="font-heading text-2xl font-bold bg-gradient-to-tl from-primary to-primary-600 bg-clip-text text-transparent tracking-tight">
        {getHeaderTitle()}
      </h1>
      
      {/* <div>
        <Button 
        size="md"
        className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                      shadow-lg hover:shadow-xl
                      transform transition-all duration-200 hover:-translate-y-0.5 text-base"
                      >
                        <User className="w-4 h-4" />
                        Profile
        </Button>
      </div> */}
    </header>
  );
};

export default Header;