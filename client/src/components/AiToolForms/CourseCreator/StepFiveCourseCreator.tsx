import { useEffect, useState, useRef } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"; // Import icons

interface courseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<courseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  console.log("[StepFive] Rendering - chaptersContent:", chaptersContent, "chapterFetchCount:", chapterFetchCount);
  const title = localStorage.getItem("selectedTitle") || "";
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>('scroll');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const chapter_titles = (localStorage.getItem("chapter_titles") || "")
    .split(/,(?=\d+\.)/)
    .map((item: string) => item.replace(/^\d+\.\s*/, "").trim());

  console.log("[StepFive] chaptersContent received:", chaptersContent, "chapterFetchCount:", chapterFetchCount);

  useEffect(() => {
    console.log("[StepFive] useEffect triggered with chaptersContent:", chaptersContent, "chapterFetchCount:", chapterFetchCount);
    if (chaptersContent.length > 0) {
      // Find the latest index with content
      let latestIndex = -1;
      for (let i = chaptersContent.length - 1; i >= 0; i--) {
        if (chaptersContent[i] && chaptersContent[i] !== "") {
          latestIndex = i;
          break;
        }
      }
      console.log("[StepFive] Latest index with content:", latestIndex);
      if (latestIndex !== -1 && latestIndex !== currentChapterIndex) {
        setCurrentChapterIndex(latestIndex);
        localStorage.setItem("chapterNumber", latestIndex.toString());
        console.log(`[StepFive] Auto-set to chapter ${latestIndex + 1} with content:`, chaptersContent[latestIndex]);
      } else {
        console.log("[StepFive] No new content to switch to, keeping index at", currentChapterIndex);
      }
    }
  }, [chaptersContent, chapterFetchCount]);

  useEffect(() => {
    // Scroll active chapter into view when changed
    if (scrollContainerRef.current && viewMode === 'scroll') {
      const container = scrollContainerRef.current;
      const activeButton = container.querySelector('.active-chapter');
      
      if (activeButton) {
        container.scrollTo({
          left: activeButton.getBoundingClientRect().left - container.getBoundingClientRect().left - 100,
          behavior: 'smooth'
        });
      }
    }
  }, [currentChapterIndex, viewMode]);
  
  const scrollChapters = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const hasContent = chaptersContent.length > 0 && !!chaptersContent[currentChapterIndex];
  console.log("[StepFive] Rendering - currentChapterIndex:", currentChapterIndex, "hasContent:", hasContent, "content:", chaptersContent[currentChapterIndex]);

  return (
    <div className="flex flex-col items-center justify-center pb-8 max-w-6xl mx-auto">
      <h2 className="text-center mt-4 text-[36px] text-primary font-bold">{title}</h2>
      
      {/* View mode toggle */}
      <div className="flex justify-center mt-4 mb-2">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setViewMode('scroll')}
            className={`px-4 py-1.5 text-sm rounded-md ${viewMode === 'scroll' ? 'bg-white shadow-md text-primary' : 'text-gray-600'}`}
          >
            Scroll View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1.5 text-sm rounded-md ${viewMode === 'grid' ? 'bg-white shadow-md text-primary' : 'text-gray-600'}`}
          >
            Grid View
          </button>
        </div>
      </div>
      
      {/* Scrollable chapter navigation */}
      {viewMode === 'scroll' && (
        <div className="relative w-full max-w-4xl">
          {/* Left scroll button */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10 hover:bg-gray-50 active:scale-95 transition-transform"
            onClick={() => scrollChapters('left')}
          >
            <ChevronLeft size={24} className="text-primary" />
          </button>
          
          {/* Scrollable container */}
          <div 
          style={{ scrollbarWidth: "none", msOverflowStyle: "none"}}
            ref={scrollContainerRef}
            className="flex gap-3 py-6 px-12 overflow-x-auto w-full scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100"
          >
            {chapter_titles?.map((title: string, index: number) => (
              <button
                key={index}
                className={`
                  min-w-[180px] p-4 rounded-lg flex flex-col items-center justify-center gap-2 
                  shadow-md hover:shadow-lg transition-all transform 
                  ${index === currentChapterIndex ? 
                    'active-chapter bg-gradient-to-br from-primary to-purple-700 text-white scale-105' : 
                    chaptersContent[index] ? 
                      'bg-white border border-primary/20 hover:border-primary hover:-translate-y-1' : 
                      'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  }
                `}
                disabled={!chaptersContent[index]}
                onClick={() => {
                  setCurrentChapterIndex(index);
                  localStorage.setItem("chapterNumber", index.toString());
                }}
              >
                <div className="text-xs uppercase font-medium tracking-wide">Chapter {index + 1}</div>
                <div className="text-center font-medium line-clamp-2 text-sm">
                  {title.length > 30 ? title.substring(0, 30) + '...' : title}
                </div>
                {chaptersContent[index] && (
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10 hover:bg-gray-50 active:scale-95 transition-transform"
            onClick={() => scrollChapters('right')}
          >
            <ChevronRight size={24} className="text-primary" />
          </button>
        </div>
      )}

      {/* Grid chapter navigation */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-4xl p-4">
          {chapter_titles?.map((title: string, index: number) => (
            <button
              key={index}
              className={`
                p-3 rounded-lg flex flex-col items-center justify-center gap-2
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
                localStorage.setItem("chapterNumber", index.toString());
              }}
            >
              <div className="flex justify-center">
                <BookOpen size={18} className={index === currentChapterIndex ? 'text-white' : 'text-primary'} />
              </div>
              <div className="text-xs font-semibold">Chapter {index + 1}</div>
              <div className="text-center text-xs line-clamp-1">{title}</div>
              {chaptersContent[index] && (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      {hasContent ? (
        <div className="w-full mt-6">
          <MarkdownEditor
            key={`chapter-${currentChapterIndex}`}
            data={chaptersContent[currentChapterIndex]}
          />
        </div>
      ) : (
        <div className="w-full flex flex-col justify-center items-center py-12 mt-4 bg-gray-50 rounded-lg">
          <Spinner />
          <h2 className="mt-4 text-gray-700 font-medium">Please wait, your course is generating</h2>
        </div>
      )}
    </div>
  );
};

export default StepFiveCourseCreator;