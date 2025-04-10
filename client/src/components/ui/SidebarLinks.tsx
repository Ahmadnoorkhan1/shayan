import React from "react";
import { Link } from "react-router";

interface SidebarLinkProps {
  to: string;
  src: string;
  title: string;
  isActive?: boolean;
}

const SidebarLinks: React.FC<SidebarLinkProps> = ({ to, src, title, isActive = false }) => {
  return (
    <li className="pb-4">
      <Link 
        to={to} 
        className={`flex items-center gap-3 transition-colors duration-200 ${
          isActive 
            ? "text-primary font-medium" 
            : "text-[#0e0e0e] "
        }`}
      >
        {/* SVG icon wrapper with gradient */}
        <div 
          className={`w-6 h-6 flex items-center justify-center ${
            isActive ? "svg-gradient-active" : "svg-gradient"
          }`}
          dangerouslySetInnerHTML={{ 
            __html: `<object 
              type="image/svg+xml" 
              data="${src}" 
              width="22" 
              height="22"
              class="icon-svg"
            ></object>` 
          }}
        />
        
        <span>{title}</span>
      </Link>
    </li>
  );
};

export default SidebarLinks;