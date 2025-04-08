import { useEffect, useState, useRef } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";
import { ChevronLeft, ChevronRight, BookOpen, LayoutGrid, ScrollText, Save, ArrowLeft, CheckCircle } from "lucide-react";
import { hideLoader } from "../../../utilities/components/Loader";
import toast from "react-hot-toast";

interface ContentViewerProps {
  chaptersContent: string[];
  chapterFetchCount: number;
  titleType: 'book' | 'course' | 'easyCourse';
  onSave?: () => void;
  onBack?: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ 
  chaptersContent, 
  chapterFetchCount, 
  titleType,
  onSave,
  onBack
}) => {
  // Get title from localStorage based on type
  const getTitleKey = () => {
    switch (titleType) {
      case 'book': return "selectedBookTitle";
      case 'course': return "selectedTitle";
      case 'easyCourse': return "selectedTitleEasyCourse";
      default: return "selectedTitle";
    }
  };

  // Get chapter titles from localStorage based on type
  const getChapterTitlesKey = () => {
    switch (titleType) {
      case 'book': return "book_chapter_titles";
      case 'course': return "chapter_titles";
      case 'easyCourse': return "easy_course_chapter_titles";
      default: return "chapter_titles";
    }
  };

  // Get chapter index from localStorage based on type
  const getChapterIndexKey = () => {
    switch (titleType) {
      case 'book': return "bookChapterNumber";
      case 'course': return "chapterNumber";
      case 'easyCourse': return "easyCourseChapterNumber";
      default: return "chapterNumber";
    }
  };

  // Generate the list of localStorage keys to clean up after saving
  const getLocalStorageKeysToCleanup = () => {
    const commonKeys = ["number_of_chapters", "isLoading"];
    
    switch (titleType) {
      case 'book':
        return [
          "selectedBookTitle",
          "bookChapterNumber",
          "book_chapter_titles", 
          "book_summary",
          "bookType",
          "book_details",
          "number_of_book_chapters",
          "book_topic",
          "original_book_topic"
        ].concat(commonKeys);
      
      case 'course':
        return [
          "selectedTitle", 
          "chapterNumber", 
          "chapter_titles",
          "course_summary",
          "number_of_course_chapters",
          "course_topic", 
          "original_course_topic"
        ].concat(commonKeys);
      
      case 'easyCourse':
        return [
          "selectedTitleEasyCourse",
          "easyCourseChapterNumber",
          "easy_course_chapter_titles",
          "number_of_easy_course_chapters",
          "original_easy_course_topic"
        ].concat(commonKeys);
      
      default:
        return commonKeys;
    }
  };

  const title = localStorage.getItem(getTitleKey()) || "";
  const savedChapterIndex = localStorage.getItem(getChapterIndexKey());
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(
    savedChapterIndex ? parseInt(savedChapterIndex) : 0
  );
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>('scroll');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  const [isUserReading, setIsUserReading] = useState<boolean>(false);
  const [newChapterNotifications, setNewChapterNotifications] = useState<number[]>([]);
  const [newChaptersCount, setNewChaptersCount] = useState<number>(0);
  const [autoSaved, setAutoSaved] = useState<boolean>(false);
  const [cleanedUpLocalStorage, setCleanedUpLocalStorage] = useState<boolean>(false);

  // Parse chapter titles from local storage
  const chapter_titles = (() => {
    try {
      const titlesString = localStorage.getItem(getChapterTitlesKey());
      if (!titlesString) return [];
      
      // Try to parse as JSON first (preferred format)
      try {
        const parsedJson = JSON.parse(titlesString);
        if (Array.isArray(parsedJson)) return parsedJson;
      } catch {
        // Fallback to string parsing
      }
      
      // Fallback to string parsing
      return titlesString
        .split(/,(?=\d+\.)/)
        .map((item: string) => {
          // Clean up title by removing redundant numbering and backslashes
          let cleanTitle = item.replace(/^\d+\.\s*/, "").trim();
          
          // Remove duplicate chapter numbers (e.g. "Chapter 15: 15.")
          cleanTitle = cleanTitle.replace(/Chapter\s+(\d+)\s*:\s*\1\.*/, "Chapter $1:");
          
          // Replace backslashes with hyphens
          cleanTitle = cleanTitle.replace(/\//g, "-");
          
          return cleanTitle;
        });
    } catch (err) {
      console.error("Error parsing chapter titles:", err);
      return [];
    }
  })();

  // Clear localStorage for this content type after saving
  const cleanupLocalStorage = () => {
    if (cleanedUpLocalStorage) return; // Only cleanup once
    
    const keysToCleanup = getLocalStorageKeysToCleanup();
    
    console.log(`[ContentViewer] Cleaning up localStorage for ${titleType}...`);
    
    // Remove each key
    keysToCleanup.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clean any chapter-specific keys
    const allStorageKeys = Object.keys(localStorage);
    const chapterSpecificKeys = allStorageKeys.filter(key => {
      return (
        key.startsWith(`${titleType}_chapter_`) ||
        key.includes('_chapter_content_') ||
        key.includes('_generation_status')
      );
    });
    
    chapterSpecificKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`[ContentViewer] Cleaned up ${keysToCleanup.length + chapterSpecificKeys.length} localStorage keys`);
    setCleanedUpLocalStorage(true);
  };

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up user activity detection
  useEffect(() => {
    const userActivityTimeout = 60000; // 1 minute of inactivity to consider not reading
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleUserActivity = () => {
      setIsUserReading(true);
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsUserReading(false);
      }, userActivityTimeout);
    };
    
    // Track user interaction events
    ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Initial activity state
    handleUserActivity();
    
    return () => {
      ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearTimeout(timeoutId);
    };
  }, []);

  // Hide global loader on component mount
  useEffect(() => {
    hideLoader();
  }, []);

  // Track content generation progress
  const [prevReadyCount, setPrevReadyCount] = useState(0);
  
  useEffect(() => {
    if (chaptersContent.length > 0) {
      hideLoader(); // Hide global loader when content is available
      
      // Count ready chapters
      const readyChapters = chaptersContent.filter(chapter => !!chapter).length;
      
      // Check if any new chapters have been generated
      if (readyChapters > prevReadyCount) {
        // Find newly generated chapters
        for (let i = 0; i < chaptersContent.length; i++) {
          if (chaptersContent[i] && 
              !chaptersContent[i].includes("loading...") && 
              !newChapterNotifications.includes(i) &&
              i >= prevReadyCount) {
            // Add new chapter to notifications
            setNewChapterNotifications(prev => [...prev, i]);
            setNewChaptersCount(prev => prev + 1);
            
            // Show toast notification
            if (i !== currentChapterIndex) {
              toast((t) => (
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={18} />
                  <span>Chapter {i + 1} is ready!</span>
                  <button 
                    onClick={() => {
                      setCurrentChapterIndex(i);
                      setNewChapterNotifications(prev => prev.filter(idx => idx !== i));
                      setNewChaptersCount(prev => prev - 1);
                      toast.dismiss(t.id);
                      localStorage.setItem(getChapterIndexKey(), i.toString());
                    }}
                    className="ml-2 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
                  >
                    View
                  </button>
                </div>
              ), {
                duration: 5000,
                position: 'bottom-right',
              });
            }
          }
        }
        
        // Only auto-navigate to latest chapter if user isn't actively reading
        // and they haven't manually selected a chapter
        if (!isUserReading && currentChapterIndex === prevReadyCount - 1) {
          setCurrentChapterIndex(readyChapters - 1);
          localStorage.setItem(getChapterIndexKey(), (readyChapters - 1).toString());
        }
        
        // Update previous count
        setPrevReadyCount(readyChapters);
      }
      
      // Auto-save when all chapters are complete
      const totalChapters = chapter_titles?.length || 0;
      if (readyChapters === totalChapters && totalChapters > 0 && onSave && !autoSaved) {
        setTimeout(() => {
          handleSave();
        }, 1500); // Short delay to ensure all content is processed
      }
    }
  }, [chaptersContent, chapterFetchCount, titleType, isUserReading, currentChapterIndex, prevReadyCount, newChapterNotifications, chapter_titles?.length, onSave, autoSaved]);

  // Enhanced save function that performs cleanup
  const handleSave = () => {
    if (onSave) {
      onSave();
      setAutoSaved(true);
      
      // Clean up localStorage after successful save
      cleanupLocalStorage();
      
      toast.success('Your content has been automatically saved!', {
        duration: 5000,
        position: 'bottom-center',
        icon: '💾',
      });
    }
  };

  // Cleanup localStorage when component unmounts after saving
  useEffect(() => {
    return () => {
      if (autoSaved && !cleanedUpLocalStorage) {
        cleanupLocalStorage();
      }
    };
  }, [autoSaved, cleanedUpLocalStorage]);

  // Handle scroll behavior
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

  // Clear the notification when navigating to a chapter
  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    localStorage.setItem(getChapterIndexKey(), index.toString());
    
    // Clear notification for this chapter
    if (newChapterNotifications.includes(index)) {
      setNewChapterNotifications(prev => prev.filter(idx => idx !== index));
      setNewChaptersCount(prev => prev - 1);
    }
  };

  // Navigation button components for reuse
  const NavigationButtons = ({ position }: { position: 'top' | 'bottom' }) => (
    <div className={`w-full max-w-6xl flex ${position === 'top' ? 'mt-2 mb-6' : 'mt-6 mb-2'} px-4 justify-between items-center`}>
      <div className="flex gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm
              bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}
        
        <button
          onClick={() => handleChapterSelect(Math.max(0, currentChapterIndex - 1))}
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
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleChapterSelect(Math.min(chaptersContent.length - 1, currentChapterIndex + 1))}
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
        
        {onSave && !autoSaved && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm
              bg-primary text-white hover:bg-primary/90 transition-all duration-200"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        )}

        {autoSaved && (
          <div className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm
            bg-green-100 text-green-700">
            <CheckCircle size={16} />
            <span>Saved</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center pb-4 sm:pb-8 w-full">
      {/* Content title */}
      <h2 className="text-center mt-2 md:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-primary font-bold px-4 break-words">
        {title}
      </h2>
      
      {/* Progress indicator with improved text contrast */}
      <div className="w-full max-w-md px-4 mt-3">
        <div className="flex justify-between text-sm sm:text-base font-medium text-gray-800 mb-1">
          <span>{readyChaptersCount} of {totalChapters} chapters ready</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* New chapters notification */}
      {newChaptersCount > 0 && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mt-3 max-w-md mx-auto text-sm flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle size={16} className="mr-2" />
            <span>{newChaptersCount} new {newChaptersCount === 1 ? 'chapter has' : 'chapters have'} been generated!</span>
          </div>
          {newChaptersCount > 0 && (
            <button 
              onClick={() => {
                // Find the first new chapter
                const firstNewChapter = newChapterNotifications[0];
                handleChapterSelect(firstNewChapter);
              }}
              className="ml-3 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
            >
              View Latest
            </button>
          )}
        </div>
      )}
      
      {/* Top navigation buttons */}
      {hasContent && <NavigationButtons position="top" />}
      
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
        <div className="relative w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-6xl px-1 sm:px-2">
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
            {chapter_titles?.map((title: string, index: number) => {
              const isNewChapter = newChapterNotifications.includes(index);
              return (
                <button
                  key={index}
                  className={`
                    min-w-[120px] sm:min-w-[160px] md:min-w-[200px] p-2 sm:p-3 md:p-4 
                    rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2
                    shadow-md hover:shadow-lg transition-all transform 
                    ${isNewChapter ? 'animate-pulse' : ''}
                    ${index === currentChapterIndex ? 
                      'active-chapter bg-gradient-to-b from-teal-300 to-purple-500 text-white scale-[1.03]' : 
                      chaptersContent[index] ? 
                        `bg-white border hover:border-primary hover:-translate-y-1 ${isNewChapter ? 'border-green-400' : 'border-primary/20'}` : 
                        'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    }
                  `}
                  disabled={!chaptersContent[index]}
                  onClick={() => handleChapterSelect(index)}
                >
                  <div className="text-xs sm:text-sm font-medium tracking-wide">
                    Chapter {index + 1}
                  </div>
                  <div className="text-center font-medium line-clamp-2 text-sm sm:text-base">
                    {typeof title === 'string' && title.length > (isMobile ? 20 : 30) ? 
                      title.substring(0, isMobile ? 20 : 30) + '...' : title}
                  </div>
                  {chaptersContent[index] && (
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-1 flex items-center justify-center
                      ${isNewChapter ? 'bg-green-400' : 'bg-green-500'}`}>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                  {isNewChapter && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      <span>!</span>
                    </div>
                  )}
                </button>
              );
            })}
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
          w-full max-w-full md:max-w-3xl lg:max-w-6xl p-2 sm:p-4">
          {chapter_titles?.map((title: string, index: number) => {
            const isNewChapter = newChapterNotifications.includes(index);
            return (
              <button
                key={index}
                className={`
                  p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2
                  border transition-all duration-200 relative
                  ${isNewChapter ? 'animate-pulse' : ''}
                  ${index === currentChapterIndex ? 
                    ' bg-gradient-to-b from-teal-300 to-purple-500 text-white border-primary shadow-lg' : 
                    chaptersContent[index] ? 
                      `bg-white hover:border-primary hover:shadow-md ${isNewChapter ? 'border-green-400' : 'border-primary/30'}` : 
                      'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200'
                  }
                `}
                disabled={!chaptersContent[index]}
                onClick={() => handleChapterSelect(index)}
              >
                <div className="flex justify-center">
                  <BookOpen size={isMobile ? 16 : 20} className={index === currentChapterIndex ? 'text-white' : 'text-primary'} />
                </div>
                <div className="text-xs sm:text-sm font-semibold">Chapter {index + 1}</div>
                <div className="text-center text-xs sm:text-sm line-clamp-2 mt-1">
                  {typeof title === 'string' ? title : `Chapter ${index + 1}`}
                </div>
                {chaptersContent[index] && (
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-2
                    ${isNewChapter ? 'bg-green-400' : 'bg-green-500'}`}></div>
                )}
                {isNewChapter && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    <span>!</span>
                  </div>
                )}
              </button>
            );
          })}
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
                `Please wait, your ${titleType === 'book' ? 'book' : 'course'} is starting to generate...` :
                `Generating chapter ${readyChaptersCount + 1} of ${totalChapters}...`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center px-4">
              This may take several minutes for each chapter
            </p>
          </div>
        )}
      </div>

      {/* Bottom navigation buttons */}
      {hasContent && <NavigationButtons position="bottom" />}
    </div>
  );
};

export default ContentViewer;