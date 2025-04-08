import React, { useState, useEffect } from 'react';
import { PenSquare } from 'lucide-react';

interface TitleSelectionProps {
  titles: string[];
  onSelectTitle: (title: string) => void;
  storageKey?: string;
  contentType?: string;
  showCustomInput?: boolean;
}

const TitleSelectionComponent: React.FC<TitleSelectionProps> = ({
  titles,
  onSelectTitle,
  contentType = 'Content',
  showCustomInput = true
}) => {
  // Get storage key based on content type
  const getCustomTitleKey = () => {
    switch (contentType) {
      case 'Easy Course':
        return 'easy_course_custom_title';
      case 'Course':
        return 'course_custom_title';
      case 'Book':
        return 'book_custom_title';
      default:
        return 'custom_title';
    }
  };
  
  // Initialize customTitle with saved value if available
  const [customTitle, setCustomTitle] = useState(() => {
    const savedTitle = localStorage.getItem(getCustomTitleKey());
    return savedTitle || '';
  });
  
  const [showCustomField, setShowCustomField] = useState(!!customTitle); // Show field if there's saved title
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // More professional, minimal color variants
  const colorVariants = [
    "from-blue-600 to-blue-500", // Professional blue
    "from-teal-600 to-teal-500", // Business teal
    "from-slate-700 to-slate-600", // Professional slate
    "from-cyan-600 to-cyan-500", // Professional cyan
    "from-gray-700 to-gray-600", // Professional gray
    "from-sky-600 to-sky-500", // Professional sky blue
  ];

  // Clean titles by removing quotation marks
  const cleanTitles = titles?.map(title => {
    if (typeof title === 'string') {
      // Remove start and end quotes if present
      return title.replace(/^["'](.*)["']$/, '$1');
    }
    return title;
  });

  // Save custom title to localStorage when changed
  useEffect(() => {
    if (customTitle) {
      localStorage.setItem(getCustomTitleKey(), customTitle);
    }
  }, [customTitle]);

  const handleTitleSelect = (title: string) => {
    // Clean any quotes from the selected title
    const cleanTitle = typeof title === 'string' ? title.replace(/^["'](.*)["']$/, '$1') : title;
    onSelectTitle(cleanTitle);
  };

  const handleCustomTitleSubmit = () => {
    if (customTitle.trim()) {
      // Clean any quotes from the custom title
      const cleanTitle = customTitle.trim().replace(/^["'](.*)["']$/, '$1');
      onSelectTitle(cleanTitle);
    }
  };

  // Handle Enter key press in custom title input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTitle.trim()) {
      handleCustomTitleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 text-center">
        Choose a Title Below or Create Your Own!
      </h2>

      {/* Title cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full px-4 py-6">
        {cleanTitles?.slice(0, 6)?.map((title: string, index: number) => {
          const colorClass = colorVariants[index % colorVariants.length];
          const isHovered = hoverIndex === index;
          
          return (
            <button
              key={index}
              className="group relative shadow-md h-32 bg-white border border-gray-200 rounded-lg 
                        hover:shadow-lg transition-all duration-300 
                       transform hover:-translate-y-1 cursor-pointer overflow-hidden"
              onClick={() => handleTitleSelect(title)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Background effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-white 
                          transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
              ></div>
              
              {/* Accent line at top with animated width */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colorClass}
                          transition-all duration-300 ease-out`}
                style={{ 
                  width: isHovered ? '100%' : '40%',
                  left: 0,
                  opacity: isHovered ? 1 : 0.7
                }}
              ></div>
              
              {/* Content with subtle animation */}
              <div className="relative h-full flex flex-col items-center justify-center p-4 z-10">
                <h3 
                  className="text-base font-medium text-gray-800 text-center
                           transition-all duration-300 ease-in-out"
                  style={{ 
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    color: isHovered ? '#000000' : '#1f2937'
                  }}
                >
                  {title}
                </h3>
              </div>
              
              {/* Bottom accent line with animation */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}
                          transition-all duration-500 ease-in-out`}
                style={{ 
                  width: isHovered ? '100%' : '0%',
                  opacity: isHovered ? 0.8 : 0
                }}
              ></div>
              
              {/* Corner decoration */}
              <div 
                className={`absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl 
                          transition-all duration-500 ease-in-out`}
                style={{
                  background: isHovered ? `linear-gradient(to top left, rgba(37, 99, 235, 0.1), transparent)` : 'transparent',
                  transform: isHovered ? 'scale(1)' : 'scale(0)',
                  opacity: isHovered ? 1 : 0
                }}
              ></div>
              
              {/* Check indicator */}
              <div 
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full 
                          flex items-center justify-center transition-all duration-300"
                style={{
                  background: isHovered ? `linear-gradient(to right, ${colorClass.split(' ')[0].replace('from-', '')}, ${colorClass.split(' ')[1].replace('to-', '')})` : 'transparent',
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-45deg)'
                }}
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom title input */}
      {showCustomInput && (
        <div className="w-full max-w-lg mt-6 mb-8 px-4">
          {!showCustomField ? (
            <button 
              onClick={() => setShowCustomField(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 
                       rounded-lg text-gray-700 hover:text-primary hover:border-primary 
                       hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <PenSquare size={18} />
              <span className="font-medium">Create your own title</span>
            </button>
          ) : (
            <div className="flex flex-col gap-4 p-5 bg-white rounded-lg border border-gray-300 
                          shadow-sm hover:shadow-md transition-all duration-300 transform">
              <label htmlFor="custom-title" className="text-sm font-semibold text-gray-800">
                Enter your own title:
              </label>
              
              <input
                id="custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter a title for your ${contentType.toLowerCase()}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-primary focus:border-primary 
                          outline-none text-gray-900 bg-gray-50 hover:bg-white
                          transition-all duration-200"
                autoFocus
              />
              
              <button
                onClick={handleCustomTitleSubmit}
                disabled={!customTitle.trim()}
                className={`w-full py-3 rounded-lg transition-all duration-300 font-medium text-sm
                           transform hover:shadow-lg ${
                             customTitle.trim() 
                               ? 'bg-primary text-white hover:-translate-y-0.5 active:translate-y-0' 
                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                           }`}
              >
                Use This Title
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TitleSelectionComponent;