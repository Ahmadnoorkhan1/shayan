import { Outlet } from "react-router";
import { useEffect } from "react";

const DashboardLayout = () => {
  // Optional: Add animation for content entry
  useEffect(() => {
    const mainContent = document.querySelector('.dashboard-content');
    if (mainContent) {
      mainContent.classList.add('animate-fadeIn');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      

        <div className="dashboard-content rounded-xl bg-white shadow-sm p-6">
          <Outlet />
        </div>
        
       
      </div>
    </div>
  );
};

export default DashboardLayout;