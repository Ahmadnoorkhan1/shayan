import { useEffect, useState, useRef } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";
import { ChevronLeft, ChevronRight, BookOpen, LayoutGrid, ScrollText } from "lucide-react";
import { hideLoader } from "../../../utilities/components/Loader";

interface CourseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<CourseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  const title = localStorage.getItem("selectedTitleEasyCourse") || "";
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>('scroll');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);

  // Parse chapter titles from local storage with error handling
  const chapter_titles = (() => {
    try {
      const titlesString = localStorage.getItem("easy_course_chapter_titles");
      if (!titlesString) return [];
      
      // Try to parse as JSON first (in case it's stored that way)
      try {
        const parsedJson = JSON.parse(titlesString);
        if (Array.isArray(parsedJson)) return parsedJson;
      } catch {
        // Fallback to string parsing if JSON fails
      }
      
      // Standard string parsing
      return titlesString
        .split(/,(?=\d+\.)/)
        .map((item: string) => item.replace(/^\d+\.\s*/, "").trim());
    } catch (err) {
      console.error("Error parsing chapter titles:", err);
      return [];
    }
  })();

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track latest chapter with content and auto-navigate
  useEffect(() => {
    if (chaptersContent.length > 0) {
      hideLoader(); // Hide global loader if active
      
      // Find the latest chapter with content
      let latestIndex = -1;
      for (let i = chaptersContent.length - 1; i >= 0; i--) {
        if (chaptersContent[i] && chaptersContent[i] !== "") {
          latestIndex = i;
          break;
        }
      }
      
      // Auto-navigate to latest chapter if it's not the current one
      if (latestIndex !== -1 && latestIndex !== currentChapterIndex) {
        setCurrentChapterIndex(latestIndex);
        localStorage.setItem("easyCourseChapterNumber", latestIndex.toString());
      }
    }
  }, [chaptersContent, chapterFetchCount]);

  // Handle scroll behavior for active chapter
  useEffect(() => {
    if (scrollContainerRef.current && viewMode === 'scroll') {
      const container = scrollContainerRef.current;
      const activeButton = container.querySelector('.active-chapter');
      
      if (activeButton) {
        // Center the active chapter button in the scroll view
        const containerWidth = container.offsetWidth;
        const buttonWidth = (activeButton as HTMLElement).offsetWidth;
        const buttonLeft = (activeButton as HTMLElement).offsetLeft;
        
        container.scrollTo({
          left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [currentChapterIndex, viewMode]);
  
  // Handle scroll button clicks
  const scrollChapters = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? 
        (isMobile ? -150 : -300) : 
        (isMobile ? 150 : 300);
        
      scrollContainerRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const hasContent = chaptersContent.length > 0 && !!chaptersContent[currentChapterIndex];
  
  // Calculate how many chapters are ready
  const readyChaptersCount = chaptersContent.filter(chapter => !!chapter).length;
  const totalChapters = chapter_titles?.length || 0;
  const progressPercent = totalChapters ? Math.round((readyChaptersCount / totalChapters) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center pb-4 sm:pb-8 w-full">
      {/* Course title */}
      <h2 className="text-center mt-2 md:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-primary font-bold px-4 break-words">
        {title}
      </h2>
      
      {/* Progress indicator */}
      <div className="w-full max-w-md px-4 mt-3">
        <div className="flex justify-between text-xs sm:text-sm mb-1">
          <span>{readyChaptersCount} of {totalChapters} chapters ready</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* View mode toggle */}
      <div className="flex justify-center mt-4 mb-2">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setViewMode('scroll')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md flex items-center gap-1.5
              ${viewMode === 'scroll' ? 'bg-white shadow-md text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <ScrollText size={isMobile ? 14 : 16} />
            <span className={`${isMobile ? 'hidden sm:inline' : ''}`}>Scroll View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md flex items-center gap-1.5
              ${viewMode === 'grid' ? 'bg-white shadow-md text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <LayoutGrid size={isMobile ? 14 : 16} />
            <span className={`${isMobile ? 'hidden sm:inline' : ''}`}>Grid View</span>
          </button>
        </div>
      </div>
      
      {/* Scrollable chapter navigation */}
      {viewMode === 'scroll' && (
        <div className="relative w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-1 sm:px-2">
          {/* Left scroll button */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-0.5 sm:p-1 z-10 
              hover:bg-gray-50 active:scale-95 transition-transform"
            onClick={() => scrollChapters('left')}
          >
            <ChevronLeft size={isMobile ? 20 : 24} className="text-primary" />
          </button>
          
          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 sm:gap-3 py-4 sm:py-6 px-8 sm:px-12 overflow-x-auto w-full 
              scrollbar-hide touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {chapter_titles?.map((title: string, index: number) => (
              <button
                key={index}
                className={`
                  min-w-[110px] sm:min-w-[150px] md:min-w-[180px] p-2 sm:p-3 md:p-4 
                  rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2
                  shadow-md hover:shadow-lg transition-all transform 
                  ${index === currentChapterIndex ? 
                    'active-chapter bg-gradient-to-br from-primary to-purple-700 text-white scale-[1.03]' : 
                    chaptersContent[index] ? 
                      'bg-white border border-primary/20 hover:border-primary hover:-translate-y-1' : 
                      'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  }
                `}
                disabled={!chaptersContent[index]}
                onClick={() => {
                  setCurrentChapterIndex(index);
                  localStorage.setItem("easyCourseChapterNumber", index.toString());
                }}
              >
                <div className="text-[10px] sm:text-xs uppercase font-medium tracking-wide">
                  Ch. {index + 1}
                </div>
                <div className="text-center font-medium line-clamp-2 text-[11px] sm:text-sm">
                  {typeof title === 'string' && title.length > (isMobile ? 20 : 30) ? 
                    title.substring(0, isMobile ? 20 : 30) + '...' : title}
                </div>
                {chaptersContent[index] && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mt-1 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-0.5 sm:p-1 z-10 
              hover:bg-gray-50 active:scale-95 transition-transform"
            onClick={() => scrollChapters('right')}
          >
            <ChevronRight size={isMobile ? 20 : 24} className="text-primary" />
          </button>
        </div>
      )}

      {/* Grid chapter navigation */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 
          w-full max-w-full md:max-w-3xl lg:max-w-4xl p-2 sm:p-4">
          {chapter_titles?.map((title: string, index: number) => (
            <button
              key={index}
              className={`
                p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2
                border transition-all duration-200
                ${index === currentChapterIndex ? 
                  'bg-gradient-to-br from-primary to-purple-700 text-white border-primary shadow-lg' : 
                  chaptersContent[index] ? 
                    'bg-white border-primary/30 hover:border-primary hover:shadow-md' : 
                    'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200'
                }
              `}
              disabled={!chaptersContent[index]}
              onClick={() => {
                setCurrentChapterIndex(index);
                localStorage.setItem("easyCourseChapterNumber", index.toString());
              }}
            >
              <div className="flex justify-center">
                <BookOpen size={isMobile ? 14 : 18} className={index === currentChapterIndex ? 'text-white' : 'text-primary'} />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold">Chapter {index + 1}</div>
              <div className="text-center text-[8px] sm:text-xs line-clamp-1">
                {typeof title === 'string' ? title : `Chapter ${index + 1}`}
              </div>
              {chaptersContent[index] && (
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mt-0.5"></div>
              )}
            </button>
          ))}
        </div>
      )}


      {/* Content area */}
      <div className="w-full px-2 sm:px-4 mt-2 sm:mt-4">
        {hasContent ? (
          <div className="w-full">
            <MarkdownEditor
              key={`chapter-${currentChapterIndex}`}
              data={chaptersContent[currentChapterIndex]}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center items-center py-8 sm:py-12 mt-2 sm:mt-4 bg-gray-50 rounded-lg">
            <Spinner />
            <h2 className="mt-4 text-sm sm:text-base text-gray-700 font-medium text-center px-4">
              {readyChaptersCount === 0 ?
                "Please wait, your easy course is starting to generate..." :
                `Generating chapter ${readyChaptersCount + 1} of ${totalChapters}...`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center px-4">
              This may take several minutes for each chapter
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons for chapters */}
      {hasContent && (
        <div className="w-full max-w-2xl flex justify-between mt-4 sm:mt-6 px-4">
          <button
            onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
            disabled={currentChapterIndex === 0}
            className={`
              flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm
              transition-all duration-200
              ${currentChapterIndex === 0 ?
                'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-primary/10 text-primary hover:bg-primary/20'}
            `}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <button
            onClick={() => setCurrentChapterIndex(prev => Math.min(chaptersContent.length - 1, prev + 1))}
            disabled={currentChapterIndex >= chaptersContent.length - 1 || !chaptersContent[currentChapterIndex + 1]}
            className={`
              flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm
              transition-all duration-200
              ${currentChapterIndex >= chaptersContent.length - 1 || !chaptersContent[currentChapterIndex + 1] ?
                'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-primary/10 text-primary hover:bg-primary/20'}
            `}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StepFiveCourseCreator;