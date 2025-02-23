import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { Outlet } from "react-router";
import { useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark overflow-hidden h-screen grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[250px_1fr]">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>

      <Header toggleSidebar={toggleSidebar}/>

      <main className="p-4 bg-transparent overflow-y-scroll overflow-x-hidden">
        <Outlet/>
      </main>
    </div>

  );
};

export default DashboardLayout;