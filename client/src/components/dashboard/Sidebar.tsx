import { SIDEBARLINKS } from "../../utilities/data/SidebarLinks";
import SidebarLinks from "../ui/SidebarLinks";
import React, { useRef, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar with animations */}
      <aside 
        ref={sidebarRef}
        className={`fixed md:relative z-40 h-screen bg-white shadow-md text-[#0e0e0e] 
                    transition-all duration-300 ease-in-out md:block
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    w-64 md:col-span-1 md:row-span-full`}
      >
        <div className="p-4">
          <div className="flex gap-4 justify-center">
            <div className="flex justify-center w-full">
              <img className="mx-auto" src="/images/logo_minilessons.png" alt="logo" />
              {isOpen && (
                <button className="flex md:hidden" onClick={toggleSidebar}>
                  <img src="/images/icons/cross.svg" alt="close" width={25} height={25} />
                </button>
              )}
            </div>
          </div>

          <ul className="mt-16 space-y-4">
            {SIDEBARLINKS?.map((link: any, index: any) => (
              <SidebarLinks key={index} src={link.src} title={link.title} to={link.to} />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
