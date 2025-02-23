import { SIDEBARLINKS } from "../../utilities/data/SidebarLinks";
import SidebarLinks from "../ui/SidebarLinks";
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar:React.FC<SidebarProps> = ({isOpen, toggleSidebar}) => {

  if(isOpen){
    return( 
    <aside className="fixed z-40 h-screen col-span-1 row-span-full bg-white shadow-md text-[#0e0e0e] block">
      <div className="p-4">
        <div className="flex gap-4 justify-center">
          <div className="flex justify-center w-full">
            <img className="mx-auto" src="/images/logo.png" alt="logo" />
          <button className="flex" onClick={toggleSidebar}>
            <img src="/images/icons/cross.svg" alt="" width={25} height={25} />
          </button>
          </div>
        </div>

        <ul className="mt-16 space-y-4">
          {
            SIDEBARLINKS.map((link:any,index:any)=>{
              return(<SidebarLinks key={index} src={link.src} title={link.title} to={link.to} />)
            })
          }
        </ul>
      </div>
    </aside>
    )
  }else{
    return(
      <aside className="col-span-1 h-screen row-span-full bg-white shadow-md text-[#0e0e0e] hidden md:block ">
      <div className="p-4">
      <div className="flex justify-center w-full">
        <img className="mx-auto" src="/images/logo.png" alt="logo" />
      </div>
        <ul className="mt-16 space-y-4">
          {
            SIDEBARLINKS.map((link:any,index:any)=>{
              return(<SidebarLinks key={index} src={link.src} title={link.title} to={link.to} />)
            })
          }
        </ul>
      </div>
    </aside>
    )
  }
};

export default Sidebar;
