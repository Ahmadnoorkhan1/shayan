import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'auto' | 'narrow' | 'medium' | 'wide';
  maxHeight?: number; // Optional max height in pixels
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  width = 'auto',
  maxHeight
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Width options
  const widthStyles = {
    auto: "max-w-xs", // Default max-width
    narrow: "w-48", // 12rem
    medium: "w-64", // 16rem
    wide: "w-80", // 20rem
  };

  // Calculate position of tooltip relative to the viewport
  useEffect(() => {
    if (!isVisible || !childRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const childRect = childRef.current?.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      
      if (!childRect || !tooltipRect) return;

      let top = 0;
      let left = 0;

      // Calculate position based on specified direction
      switch (position) {
        case 'top':
          top = childRect.top - tooltipRect.height - 8;
          left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = childRect.bottom + 8;
          left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          left = childRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          left = childRect.right + 8;
          break;
      }

      // Adjust if tooltip goes off screen
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Horizontal constraints
      if (left < 16) left = 16;
      if (left + tooltipRect.width > viewport.width - 16) {
        left = viewport.width - tooltipRect.width - 16;
      }

      // Vertical constraints
      if (top < 16) {
        // If it would go off the top, flip to bottom if that fits better
        if (position === 'top') {
          top = childRect.bottom + 8;
        } else {
          top = 16;
        }
      }
      if (top + tooltipRect.height > viewport.height - 16) {
        // If it would go off the bottom, flip to top if that fits better
        if (position === 'bottom') {
          top = childRect.top - tooltipRect.height - 8;
        } else {
          top = viewport.height - tooltipRect.height - 16;
        }
      }

      setTooltipPosition({ top, left });
    };

    // Update position immediately and on window resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, position]);

  // Clone the child element and attach mouse event handlers
  const childWithEvents = React.cloneElement(children, {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
    className: `${children.props.className || ''} tooltip-trigger`,
    ref: childRef
  });

  // Tooltip arrow style based on position
  const getArrowStyle = () => {
    const baseStyle = "absolute w-0 h-0 border-4";
    
    switch (position) {
      case 'top':
        return `${baseStyle} bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-zinc-950 border-x-transparent border-b-transparent`;
      case 'bottom':
        return `${baseStyle} top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-zinc-950 border-x-transparent border-t-transparent`;
      case 'left':
        return `${baseStyle} right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-zinc-950 border-y-transparent border-r-transparent`;
      case 'right':
        return `${baseStyle} left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-zinc-950 border-y-transparent border-l-transparent`;
    }
  };

  return (
    <>
      {childWithEvents}
      
      {isVisible && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            animation: 'tooltip-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div 
            className={`bg-zinc-950 text-white text-xs 
                      rounded-md py-2 px-3 shadow-lg ${widthStyles[width]} break-words`}
            style={{ 
              lineHeight: '1.4',
              fontWeight: 450,
              letterSpacing: '0.01em',
              maxHeight: maxHeight ? `${maxHeight}px` : 'none',
              overflowY: maxHeight ? 'auto' : 'visible',
            }}
          >
            {content}
            <div className={getArrowStyle()} />
          </div>
        </div>,
        document.body
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
    </>
  );
};

export default Tooltip;