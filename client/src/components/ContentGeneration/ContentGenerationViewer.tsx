import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Save, BookOpen, X, AlertTriangle } from 'lucide-react';
import apiService from '../../utilities/service/api';
import MarkdownEditor from "../../components/ui/markdowneditor";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

interface ContentGenerationViewerProps {
  title: string;
  summary: string;
  chapterTitles: string[];
  contentType: string;
  contentCategory: string;
  contentDetails: Record<string, string>;
  onBack: () => void;
}

const LOCAL_STORAGE_KEYS = {
  CHAPTERS: 'content_generation_chapters',
  CURRENT_INDEX: 'content_generation_current_index',
  IS_GENERATING: 'content_generation_is_generating',
  PROGRESS: 'content_generation_progress',
  STOPPED: 'content_generation_stopped',
  COMPLETED_COUNT: 'content_generation_completed_count',
  GENERATION_ID: 'content_generation_id'
};

const ContentGenerationViewer: React.FC<ContentGenerationViewerProps> = ({
  title,
  summary,
  chapterTitles,
  contentType,
  contentCategory,
  contentDetails,
  onBack,
}) => {
  // Create unique identifier for this generation session
  const [generationId] = useState(() => `gen_${Date.now()}`);
  // const [chapters, setChapters] = useState<any>(() => {
  //   // Try to recover from localStorage if available
  //   const savedChapters = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAPTERS);
  //   const savedId = localStorage.getItem(LOCAL_STORAGE_KEYS.GENERATION_ID);



   
    
  //   if (savedChapters && savedId === generationId) {
  //     try {
  //       return JSON.parse(savedChapters);
  //     } catch (e) {
  //       console.error("Failed to parse saved chapters:", e);
  //     }
  //   }
    
  //   return new Array(chapterTitles.length).fill("");
  // });
  const navigate = useNavigate()

const [chapters, setChapters ] = useState<any>([])

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_INDEX);
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [isGenerating, setIsGenerating] = useState(() => {
    const savedGenerating = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_GENERATING);
    return savedGenerating ? savedGenerating === 'true' : true;
  });
  
  const [generationProgress, setGenerationProgress] = useState(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);
    return savedProgress ? parseInt(savedProgress, 10) : 0;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  // Calculate completed chapters
  const completedChapters = chapters.filter((chapter:any) => chapter && chapter.length > 0).length;
  
  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
    localStorage.setItem(LOCAL_STORAGE_KEYS.GENERATION_ID, generationId);
  }, [chapters, generationId]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_INDEX, currentChapterIndex.toString());
  }, [currentChapterIndex]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_GENERATING, isGenerating.toString());
  }, [isGenerating]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, generationProgress.toString());
  }, [generationProgress]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPLETED_COUNT, completedChapters.toString());
  }, [completedChapters]);

  // Warn before closing/refreshing page during generation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        const message = 'Content generation is in progress. If you leave, progress may be lost.';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGenerating]);

  // Start generating chapters on mount
  useEffect(() => {
    // Check if we need to start fresh or continue where we left off
    if (completedChapters === 0 || 
        completedChapters < chapterTitles.length && 
        localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) !== 'true') {
      generateChapters();
    } else {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
    
    // Cleanup function to mark generation as stopped if component unmounts
    return () => {
      if (isGenerating) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
      }
    };
  }, []);


  const handleSaveContent = async () => {
    // toast.success("Content saved successfully!")

    const type = contentType === "course" ? "course" : "book";
  
  const url = `/onboard/addContent/${type}`;
   
  
  
    const payload = {
      creator_id: 1, // user._id,
      course_title: title,
      content: JSON.stringify(chapters) ,
      type: contentType 
    };
    const response = await apiService.post(url, payload)
    if (response.success) {
      // toast.success(`${contentType === 'book' ? 'Book' : 'Course'} saved successfully!`);
      navigate(`/dashboard?highlight=${response.data.course_id}`);
    } else {
      toast.error(response.message || "Failed to save content");
    }
    
  }

  // Generate chapters function with improved error handling and progress tracking
  const generateChapters = async () => {
    const MAX_RETRIES = 5;
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'false');
    
    // Start where we left off if there are already some chapters
    const startIndex = completedChapters > 0 ? completedChapters : 0;
    
    // If we're starting fresh, reset chapters array
    if (startIndex === 0) {
      const emptyChapters = new Array(chapterTitles.length).fill("");
      setChapters(emptyChapters);
    }
    
    // Set the initial progress based on already completed chapters
    setGenerationProgress(Math.round((startIndex / chapterTitles.length) * 100));
    
    for (let index = startIndex; index < chapterTitles.length; index++) {
      // Check if generation has been stopped
      if (localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) === 'true') {
        break;
      }
      
      const chapter = chapterTitles[index];
      let attempts = 0;
      let success = false;
      
      // Update progress indicator
      setGenerationProgress(Math.round(((index) / chapterTitles.length) * 100));
      
      while (attempts < MAX_RETRIES && !success) {
        try {
          const chapterPayload = {
            chapterNo: index + 1,
            chapter,
            title: title,
            summary: summary,
            contentType: contentType,
            contentCategory: contentCategory,
            contentDetails: contentDetails
          };
          
          // Show toast when starting a new chapter
          toast.loading(`Generating chapter ${index + 1}: ${chapter}`, {
            id: `chapter-${index}`,
            duration: 3000
          });
          
          const endpoint = "/onboard/generate-chapter-content";
          
          const chapterResponse = await apiService.post(
            endpoint,
            chapterPayload,
            { timeout: 120000 }  // Increased timeout for complex content
          );
          
          if (chapterResponse.success) {
            // Check if generation was stopped during API call
            if (localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) === 'true') {
              break;
            }
            
            // Update the chapters array with new content
            setChapters((prev:any) => {
              const newChapters = [...prev];
              newChapters[index] = chapterResponse.data?.content;
              return newChapters;
            });
            
            // Show success toast
            toast.success(`Chapter ${index + 1} generated!`, {
              id: `chapter-${index}`,
            });
            
            success = true;
          } else {
            toast.error(`Failed attempt ${attempts + 1} for chapter ${index + 1}`, {
              id: `chapter-${index}`,
            });
            throw new Error(chapterResponse.message);
          }
        } catch (error) {
          console.error(`Error generating chapter ${index + 1} (Attempt ${attempts + 1}):`, error);
          attempts++;
          
          // Add a small delay before retrying
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      // Handle failure after all retries
      if (!success && localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) !== 'true') {
        const errorMsg = `Failed to generate chapter ${index + 1} after ${MAX_RETRIES} attempts.`;
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    }
    
    // Finalize generation
    setGenerationProgress(100);
    setIsGenerating(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'false');
    
    // If all chapters were generated successfully
    if (completedChapters === chapterTitles.length) {
      toast.success('All chapters generated successfully!');
    }
  };
  
  // Save handler with error handling
  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      // Pass generated chapters back to parent component
      handleSaveContent();
      
      // Clear localStorage after successful save
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // toast.success('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      setIsSaving(false);
    }
  }, [chapters, handleSaveContent]);
  
  // Stop generation handler
  const handleStopGeneration = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
    setErrorMessage("Content generation was stopped.");
    setIsGenerating(false);
    toast.success('Generation stopped');
  }, []);
  
  // Navigation handler with checks
  const navigateToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapterTitles.length) {
      setCurrentChapterIndex(index);
    }
  }, [chapterTitles.length]);

  // Handle back button with confirmation if needed
  // const handleBack = useCallback(() => {
  //   if (isGenerating) {
  //     setShowLeaveWarning(true);
  //   } else {
  //     // Clear localStorage if we're leaving after completion
  //     if (completedChapters === chapterTitles.length) {
  //       Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
  //         localStorage.removeItem(key);
  //       });
  //     }
  //     onBack();
  //   }
  // }, [isGenerating, completedChapters, chapterTitles.length, onBack]);
  
  // Confirm leaving during generation
  const confirmLeave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
    setShowLeaveWarning(false);
    onBack();
  }, [onBack]);



 

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
       
        <h2 className="text-lg font-medium text-center flex-1">{title}</h2>
        <div className="flex items-center">
          {isGenerating ? (
            <button 
              onClick={handleStopGeneration} 
              className="flex items-center text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5 mr-1" />
              Stop
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={isSaving || completedChapters === 0} 
              className={`flex items-center ${
                isSaving || completedChapters === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } px-4 py-2 rounded-md transition-colors duration-150`}
              
            >
              <Save className="h-5 w-5 mr-1" />
              {isSaving ? 'Saving...' : 'Save Content'}
            </button>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className={`px-4 py-2 ${isGenerating ? 'bg-purple-50' : 'bg-green-50'}`}>
        <div className="flex items-center justify-between mb-1">
          <div className={`text-sm font-medium ${isGenerating ? 'text-purple-700' : 'text-green-700'}`}>
            {isGenerating ? 
              `Generating chapters (${completedChapters} of ${chapterTitles.length})` :
              `Generated ${completedChapters} of ${chapterTitles.length} chapters`
            }
          </div>
          <div className={`text-sm font-medium ${isGenerating ? 'text-purple-700' : 'text-green-700'}`}>
            {generationProgress}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${isGenerating ? 'bg-purple-600' : 'bg-green-600'} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm text-red-700 font-medium">Generation Error</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
              {isGenerating && (
                <button 
                  onClick={generateChapters}
                  className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Retry Generation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chapter navigation sidebar */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Chapters</h3>
          </div>
          <div className="py-2">
            {chapterTitles.map((chapterTitle, index) => (
              <button
                key={index}
                onClick={() => navigateToChapter(index)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 focus:outline-none
                  ${index === currentChapterIndex ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : 'text-gray-700 hover:bg-gray-50'}
                  ${!chapters[index] ? 'opacity-50' : ''}
                `}
                disabled={!chapters[index]}
              >
                <div className="flex items-center">
                  <span className="mr-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="truncate">{chapterTitle}</span>
                  {!chapters[index] && isGenerating && (
                    <Loader2 className="ml-auto h-3 w-3 text-gray-400 animate-spin" />
                  )}
                  {chapters[index] && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chapter content */}
        <div className="flex-1 overflow-y-auto p-6">
          {chapters[currentChapterIndex] ? (
            <div className="prose max-w-none">
              {/* <h2 className="text-2xl font-bold mb-4">{chapterTitles[currentChapterIndex]}</h2> */}
              <MarkdownEditor data={chapters[currentChapterIndex]} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              {isGenerating ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p>Generating chapter content...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a minute or two</p>
                </>
              ) : (
                <>
                  <BookOpen className="h-10 w-10 mb-4" />
                  <p>Chapter content not available</p>
                  {completedChapters > 0 && (
                    <button 
                      onClick={generateChapters}
                      className="mt-4 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded"
                    >
                      Continue Generation
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation footer */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={() => navigateToChapter(currentChapterIndex - 1)}
          disabled={currentChapterIndex === 0}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium
            ${currentChapterIndex === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }
          `}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Chapter
        </button>
        <div className="text-sm text-gray-500">
          Chapter {currentChapterIndex + 1} of {chapterTitles.length}
        </div>
        <button
          onClick={() => navigateToChapter(currentChapterIndex + 1)}
          disabled={currentChapterIndex === chapterTitles.length - 1}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium
            ${currentChapterIndex === chapterTitles.length - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }
          `}
        >
          Next Chapter
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Leave confirmation modal */}
      {showLeaveWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stop generation?</h3>
            <p className="text-gray-600 mb-4">
              Content generation is in progress. If you leave now, your progress will be saved, but generation will stop.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowLeaveWarning(false)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
              >
                Stay
              </button>
              <button 
                onClick={confirmLeave} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerationViewer;