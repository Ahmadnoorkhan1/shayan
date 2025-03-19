import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'auto' | 'narrow' | 'medium' | 'wide'; // Add width options
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  width = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Position style mapping
  const positionStyles = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2",
    left: "right-full top-1/2 transform -translate-x-2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform translate-x-2 -translate-y-1/2 ml-2",
  };
  
  // Arrow position style mapping
  const arrowStyles = {
    top: "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-purple-700 border-x-transparent border-b-transparent",
    bottom: "top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-purple-700 border-x-transparent border-t-transparent", 
    left: "right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-purple-700 border-y-transparent border-r-transparent",
    right: "left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-purple-700 border-y-transparent border-l-transparent",
  };

  // Width options
  const widthStyles = {
    auto: "min-w-max", // Auto width
    narrow: "w-48", // 12rem
    medium: "w-64", // 16rem
    wide: "w-80", // 20rem
  };

  // Clone the child element and attach mouse event handlers
  const childWithEvents = React.cloneElement(children, {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
    className: `${children.props.className || ''} tooltip-trigger`,
  });

  return (
    <div className="relative inline-block">
      {childWithEvents}
      
      {isVisible && (
        <div className={`absolute z-50 ${positionStyles[position]}`}>
          <div 
            className={`bg-zinc-950 text-white text-xs 
                      rounded-md py-2 px-3 pointer-events-none shadow-lg ${widthStyles[width]}`}
            style={{ 
              animation: 'tooltip-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              lineHeight: '1.4',
              whiteSpace: 'normal',
              fontWeight: 450,
              letterSpacing: '0.01em',
            }}
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`}
            />
          </div>
        </div>
      )}
      
      <style>{`
        .tooltip-trigger {
          position: relative;
          z-index: 1;
        }
        
        @keyframes tooltip-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95) translate(0, 5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;