import React from 'react';
import { Button } from '../ui/button';
import { User } from 'lucide-react';
interface HeaderProps {
  toggleSidebar: () => void;
}
const Header: React.FC<HeaderProps>  = ({ toggleSidebar }) => {
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
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div>
        <Button 
        size="md"
        
  className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                      shadow-lg hover:shadow-xl
                      transform transition-all duration-200 hover:-translate-y-0.5 text-base"
                      
                      >
                        <User className="w-4 h-4" />
                        Profile
        </Button>
      </div>
    </header>
  );
};

export default Header;
