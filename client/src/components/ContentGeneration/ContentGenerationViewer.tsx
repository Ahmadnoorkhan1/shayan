import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Save, BookOpen, X, AlertTriangle, RefreshCw, Check, Clock, ArrowLeft, FileText } from 'lucide-react';
import apiService from '../../utilities/service/api';
import MarkdownEditor from "../../components/ui/markdowneditor";
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router';
import Modal from '../../components/ui/Modal';
import { getUserIdWithFallback } from "../../utilities/shared/userUtils";

// Add interface for Chapter structure
interface Chapter {
  chapterNo: number;
  title: string;
  keyPoints: string[];
}

interface ContentGenerationViewerProps {
  title: string;
  summary: string;
  chapterTitles: any[]; // Accept either string[] or Chapter[]
  contentType: string;
  contentCategory: string;
  contentDetails: Record<string, string>;
  onBack: () => void;
}

// Comprehensive localStorage key management
const LOCAL_STORAGE_KEYS = {
  // ContentGenerationViewer keys
  CHAPTERS: 'content_generation_chapters',
  CURRENT_INDEX: 'content_generation_current_index',
  IS_GENERATING: 'content_generation_is_generating',
  PROGRESS: 'content_generation_progress',
  STOPPED: 'content_generation_stopped',
  COMPLETED_COUNT: 'content_generation_completed_count',
  GENERATION_ID: 'content_generation_id',
  GENERATION_ERROR: 'content_generation_error',
  GENERATING_CHAPTER_INDEX: 'content_generation_current_generating_index',
  FINAL_CHAPTERS:"final_chapters",
  // Keys from previous steps
  CONTENT_DATA: 'content_data',
  CONTENT_SUMMARY: 'content_summary',
  CHAPTER_TITLES: 'chapter_titles'
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
  // Extract chapter titles from the input data structure
  const [chapterTitlesArray, setChapterTitlesArray] = useState<string[]>([]);
  
  // Process chapter titles on mount - extract only the title strings
  useEffect(() => {
    if (Array.isArray(chapterTitles) && chapterTitles.length > 0) {
      // Check if we have the new object structure or just strings
      if (typeof chapterTitles[0] === 'string') {
        setChapterTitlesArray(chapterTitles as string[]);
      } else {
        // Extract titles from chapter objects
        const extractedTitles = chapterTitles.map((chapter: any) => chapter.title || `Chapter ${chapter.chapterNo}`);
        setChapterTitlesArray(extractedTitles);
      }
    } else {
      setChapterTitlesArray([]);
    }
  }, [chapterTitles]);

  // Reference to generation session for persistence
  const [generationId] = useState(() => {
    const savedId = localStorage.getItem(LOCAL_STORAGE_KEYS.GENERATION_ID);
    return savedId || `gen_${Date.now()}`;
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store important props in localStorage for recovery after refresh
  useEffect(() => {
    const contentData = {
      title,
      summary,
      chapterTitles,
      contentType,
      contentCategory,
      contentDetails
    };
    localStorage.setItem('content_generation_props', JSON.stringify(contentData));
  }, [title, summary, chapterTitles, contentType, contentCategory, contentDetails]);
  
  // Initialize chapters array - content for each chapter
  const [chapters, setChapters] = useState<string[]>(() => {
    const savedChapters = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAPTERS);
    if (savedChapters) {
      try {
        const parsedChapters = JSON.parse(savedChapters);
        if (Array.isArray(parsedChapters)) {
          return parsedChapters;
        }
      } catch (e) {
        console.error("Failed to parse saved chapters:", e);
      }
    }
    
    // Initialize with empty strings for each chapter
    return new Array(chapterTitles.length).fill("");
  });

  // UI state management
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_INDEX);
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [isGenerating, setIsGenerating] = useState(() => {
    const savedGenerating = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_GENERATING);
    return savedGenerating ? savedGenerating === 'true' : true;
  });
  
  const [generatingChapterIndex, setGeneratingChapterIndex] = useState(() => {
    const savedIndex = localStorage.getItem(LOCAL_STORAGE_KEYS.GENERATING_CHAPTER_INDEX);
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  
  const [generationProgress, setGenerationProgress] = useState(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);
    return savedProgress ? parseInt(savedProgress, 10) : 0;
  });

  // Additional UI states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.GENERATION_ERROR);
  });
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generationStartTime] = useState<number>(() => Date.now());
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('Calculating...');
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  
  // Refs for navigation blocking
  const historyBlockerRef = useRef<any>(null);
  const popStateHandlerRef = useRef<any>(null);

  // Calculate completed chapters
  const completedChapters = chapters.filter(chapter => chapter && chapter.length > 0).length;
  
  // Persist states to localStorage
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
    localStorage.setItem(LOCAL_STORAGE_KEYS.GENERATING_CHAPTER_INDEX, generatingChapterIndex.toString());
  }, [generatingChapterIndex]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, generationProgress.toString());
  }, [generationProgress]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPLETED_COUNT, completedChapters.toString());
  }, [completedChapters]);
  
  useEffect(() => {
    if (errorMessage) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.GENERATION_ERROR, errorMessage);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.GENERATION_ERROR);
    }
  }, [errorMessage]);

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

  // Block navigation during generation using history API
  useEffect(() => {
    if (isGenerating) {
      // Push state to enable back button detection
      window.history.pushState(null, '', window.location.pathname);
      
      // Handle browser back button
      const handlePopState = () => {
        // Prevent going back by pushing state again
        window.history.pushState(null, '', window.location.pathname);
        toast.error("Content generation in progress. Please wait or click 'Stop' to leave.");
        setShowBackConfirmation(true);
      };
      
      // Store reference for cleanup
      popStateHandlerRef.current = handlePopState;
      window.addEventListener('popstate', handlePopState);
    }
    
    return () => {
      if (popStateHandlerRef.current) {
        window.removeEventListener('popstate', popStateHandlerRef.current);
      }
    };
  }, [isGenerating]);

  // Update estimated time remaining
  useEffect(() => {
    if (!isGenerating || completedChapters === 0) return;

    const updateEstimatedTime = () => {
      const elapsedSeconds = (Date.now() - generationStartTime) / 1000;
      const chaptersPerSecond = completedChapters / elapsedSeconds;
      
      if (chaptersPerSecond > 0) {
        const remainingChapters = chapterTitlesArray.length - completedChapters;
        const remainingSeconds = remainingChapters / chaptersPerSecond;
        
        // Format time
        if (remainingSeconds < 60) {
          setEstimatedTimeRemaining('Less than a minute');
        } else if (remainingSeconds < 3600) {
          setEstimatedTimeRemaining(`About ${Math.ceil(remainingSeconds / 60)} minutes`);
        } else {
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.ceil((remainingSeconds % 3600) / 60);
          setEstimatedTimeRemaining(`About ${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`);
        }
      }
    };

    const interval = setInterval(updateEstimatedTime, 30000);
    updateEstimatedTime(); // Initial calculation
    
    return () => clearInterval(interval);
  }, [isGenerating, completedChapters, generationStartTime, chapterTitlesArray.length]);

  // Start generating chapters on mount
  useEffect(() => {
    // Wait until chapterTitlesArray is populated
    if (chapterTitlesArray.length === 0) return;
    
    // Check if we need to start fresh or continue where we left off
    if (completedChapters === 0 || 
        completedChapters < chapterTitlesArray.length && 
        localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) !== 'true') {
      generateChapters();
    } else {
      setIsGenerating(false);
      setGenerationProgress(100);
      setIsGenerationComplete(completedChapters === chapterTitlesArray.length);
    }
    
    // Cleanup function to mark generation as stopped if component unmounts
    return () => {
      if (isGenerating) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
      }
    };
  }, [chapterTitlesArray]);

  // Save content to server and navigate to dashboard
  const handleSaveContent = async () => {
    setIsSaving(true);
    
    try {
      const type = contentCategory === "book" ? "book" : "course";
      const url = `/onboard/addContent/${type}`;
      
      const payload = {
        creator_id: getUserIdWithFallback(),
        course_title: title,
        content: JSON.stringify(chapters),
        type: contentType,
        summary: summary
      };
      
      const response = await apiService.post(url, payload);
      
      if (response.success) {
        // Clean up localStorage
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Show success modal with ID
        setSavedContentId(response.data.course_id);
        setShowSaveSuccessModal(true);
      } else {
        toast.error(response.message || "Failed to save content");
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
      setIsSaving(false);
    }
  };

  // Generate chapters function with improved error handling and progress tracking
  const generateChapters = async () => {
    const MAX_RETRIES = 5;
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'false');
    setIsGenerating(true);
    
    // Start where we left off if there are already some chapters
    const startIndex = completedChapters > 0 ? completedChapters : 0;
    setGeneratingChapterIndex(startIndex);
    
    // If we're starting fresh, reset chapters array
    if (startIndex === 0) {
      const emptyChapters = new Array(chapterTitlesArray.length).fill("");
      setChapters(emptyChapters);
    }
    
    // Set the initial progress based on already completed chapters
    setGenerationProgress(Math.round((startIndex / chapterTitlesArray.length) * 100));
    
    for (let index = startIndex; index < chapterTitlesArray.length; index++) {
      // Check if generation has been stopped
      if (localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) === 'true') {
        setIsGenerating(false);
        setErrorMessage("Content generation was stopped.");
        break;
      }
      
      setGeneratingChapterIndex(index);
      const chapterTitle = chapterTitlesArray[index];
      
      // Get keyPoints if available from the original chapterTitles (if it has that structure)
      let keyPoints: string[] = [];
      if (Array.isArray(chapterTitles) && typeof chapterTitles[0] === 'object') {
        const chapterObj = chapterTitles[index] as Chapter;
        if (chapterObj && Array.isArray(chapterObj.keyPoints)) {
          keyPoints = chapterObj.keyPoints;
        }
      }
      
      let attempts = 0;
      let success = false;
      
      // Update progress indicator
      setGenerationProgress(Math.round(((index) / chapterTitlesArray.length) * 100));
      
      while (attempts < MAX_RETRIES && !success) {
        try {
          const chapterPayload = {
            chapterNo: index + 1,
            chapter: chapterTitle,
            keyPoints: keyPoints,
            title: title,
            summary: summary,
            contentType: contentType,
            contentCategory: contentCategory,
            contentDetails: contentDetails
          };
          
          // Show toast when starting a new chapter
          // toast.loading(`Generating chapter ${index + 1}: ${chapterTitle}`, {
          //   id: `chapter-${index}`,
          //   duration: 3000
          // });
          
          const endpoint = "/onboard/generate-chapter-content";
          
          const chapterResponse = await apiService.post(
            endpoint,
            chapterPayload,
            { timeout: 120000 }  // Increased timeout for complex content
          );
          
          if (chapterResponse.success) {
            // Check if generation was stopped during API call
            if (localStorage.getItem(LOCAL_STORAGE_KEYS.STOPPED) === 'true') {
              setIsGenerating(false);
              setErrorMessage("Content generation was stopped.");
              break;
            }
            
            // Update the chapters array with new content
            setChapters(prev => {
              const newChapters = [...prev];
              newChapters[index] = chapterResponse.data?.content;
              return newChapters;
            });
            
            // Show success toast
            // toast.success(`Chapter ${index + 1} generated!`, {
            //   id: `chapter-${index}`,
            // });
            
            // Auto-navigate to newly generated chapter if user is viewing the previous one
            if (currentChapterIndex === index - 1) {
              setCurrentChapterIndex(index);
            }
            
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
    
    // Check if all chapters were generated successfully
    const finalCompletedChapters = chapters.filter(chapter => chapter && chapter.length > 0).length;
    if (finalCompletedChapters === chapterTitlesArray.length) {
      setIsGenerationComplete(true);
      toast.success('All chapters generated successfully!');
    }
  };
  
  // Stop generation handler
  const handleStopGeneration = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
    setIsGenerating(false);
    setErrorMessage("Content generation was stopped manually.");
    toast.success('Generation stopped');
  }, []);
  
  // Navigation handler with checks
  const navigateToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapterTitlesArray.length && chapters[index]) {
      setCurrentChapterIndex(index);
    }
  }, [chapterTitlesArray.length, chapters]);

  // Handle back request from button or browser
  const handleBackRequest = useCallback(() => {
    if (isGenerating) {
      setShowLeaveWarning(true);
    } else {
      setShowBackConfirmation(true);
    }
  }, [isGenerating]);
  
  // Confirm leaving during generation
  const confirmLeave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOPPED, 'true');
    setShowLeaveWarning(false);
    setIsGenerating(false);
    onBack();
  }, [onBack]);
  
  // Navigate to dashboard after successful save
  const goToDashboard = useCallback(() => {
    navigate(savedContentId ? `/dashboard?highlight=${savedContentId}` : "/dashboard");
  }, [navigate, savedContentId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={handleBackRequest}
          disabled={isGenerating}
          className={`mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isGenerating ? "Cannot go back while generating" : "Go back to summary"}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-lg font-medium text-center flex-1">{title}</h2>
        
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <button 
              onClick={handleStopGeneration} 
              className="flex items-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Stop Generation
            </button>
          ) : (
            <button 
              onClick={handleSaveContent} 
              disabled={isSaving || completedChapters === 0} 
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-150 ${
                isSaving || completedChapters === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </button>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className={`px-4 py-2 ${isGenerating ? 'bg-purple-50' : completedChapters === chapterTitlesArray.length ? 'bg-green-50' : 'bg-amber-50'}`}>
        <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
          <div className={`text-sm font-medium ${isGenerating ? 'text-purple-700' : completedChapters === chapterTitlesArray.length ? 'text-green-700' : 'text-amber-700'}`}>
            {isGenerating ? (
              <div className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                <span>Generating chapter {generatingChapterIndex + 1}: {chapterTitlesArray[generatingChapterIndex]}</span>
              </div>
            ) : completedChapters === chapterTitlesArray.length ? (
              <div className="flex items-center">
                <Check className="h-3 w-3 mr-2" />
                <span>All chapters generated successfully!</span>
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-2" />
                <span>Generation incomplete: {completedChapters} of {chapterTitlesArray.length} chapters</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center text-xs text-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>Est. time remaining: {estimatedTimeRemaining}</span>
              </div>
            )}
            <div className={`text-sm font-medium ${isGenerating ? 'text-purple-700' : completedChapters === chapterTitlesArray.length ? 'text-green-700' : 'text-amber-700'}`}>
              {generationProgress}%
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${
              isGenerating ? 'bg-purple-600' : 
              completedChapters === chapterTitlesArray.length ? 'bg-green-600' : 'bg-amber-500'
            } h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Generation Error</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
              <div className="mt-2 flex gap-2">
                {!isGenerating && completedChapters < chapterTitlesArray.length && (
                  <button 
                    onClick={generateChapters}
                    className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resume Generation
                  </button>
                )}
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chapter navigation sidebar */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h3 className="font-medium text-gray-900">Table of Contents</h3>
          </div>
          <div className="py-2">
            {chapterTitlesArray.map((chapterTitle, index) => {
              const isChapterReady = chapters[index] && chapters[index].length > 0;
              const isCurrentlyGenerating = isGenerating && generatingChapterIndex === index;
              
              return (
                <button
                  key={index}
                  onClick={() => isChapterReady && navigateToChapter(index)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 focus:outline-none
                    ${index === currentChapterIndex ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'}
                    ${!isChapterReady ? 'cursor-not-allowed opacity-60' : ''}
                    relative
                  `}
                >
                  <div className="flex items-center">
                    <span className={`mr-2 w-5 h-5 flex items-center justify-center rounded-full 
                      ${isChapterReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'} 
                      text-xs font-medium`}>
                      {index + 1}
                    </span>
                    <span className="truncate">{chapterTitle}</span>
                    
                    {isCurrentlyGenerating && (
                      <div className="ml-auto">
                        <Loader2 className="h-3 w-3 text-purple-500 animate-spin" />
                      </div>
                    )}
                    
                    {isChapterReady && !isCurrentlyGenerating && (
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  
                  {isCurrentlyGenerating && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-300">
                      <div className="h-full bg-purple-600 animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Chapter content */}
        <div className="flex-1 overflow-y-auto">
          {chapters[currentChapterIndex] ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{chapterTitlesArray[currentChapterIndex]}</h2>
              <div className="prose max-w-none">
                <MarkdownEditor data={chapters[currentChapterIndex]} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
              {isGenerating && generatingChapterIndex === currentChapterIndex ? (
                <>
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-50"></div>
                    <div className="relative w-full h-full bg-purple-50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Generating Chapter {currentChapterIndex + 1}</h3>
                  <p className="text-center max-w-md">
                    We're creating high-quality content for "{chapterTitlesArray[currentChapterIndex]}". This typically takes 1-2 minutes per chapter.
                  </p>
                </>
              ) : isGenerating ? (
                <>
                  <BookOpen className="h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Chapter Not Generated Yet</h3>
                  <p>This chapter is in the queue for generation.</p>
                  <button 
                    onClick={() => navigateToChapter(generatingChapterIndex)}
                    className="mt-6 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    View Current Generation
                  </button>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Chapter Content Missing</h3>
                  <p className="mb-6">This chapter wasn't generated successfully.</p>
                  <button 
                    onClick={generateChapters}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resume Generation
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation footer */}
      <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-white">
        <button
          onClick={() => navigateToChapter(currentChapterIndex - 1)}
          disabled={currentChapterIndex === 0 || !chapters[currentChapterIndex - 1]}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium
            ${currentChapterIndex === 0 || !chapters[currentChapterIndex - 1]
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-purple-600 hover:bg-purple-50 active:bg-purple-100'
            }
          `}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Chapter
        </button>
        
        <div className="text-sm text-gray-500 font-medium">
          Chapter {currentChapterIndex + 1} of {chapterTitlesArray.length}
        </div>
        
        <button
          onClick={() => navigateToChapter(currentChapterIndex + 1)}
          disabled={currentChapterIndex === chapterTitlesArray.length - 1 || !chapters[currentChapterIndex + 1]}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium
            ${currentChapterIndex === chapterTitlesArray.length - 1 || !chapters[currentChapterIndex + 1]
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-purple-600 hover:bg-purple-50 active:bg-purple-100'
            }
          `}
        >
          Next Chapter
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Leave confirmation modal */}
      <Modal
        isOpen={showLeaveWarning}
        onClose={() => setShowLeaveWarning(false)}
        title="Stop Generation and Go Back?"
      >
        <div className="p-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Content generation is in progress</h3>
          <p className="text-gray-600 mb-6 text-center">
            If you leave now, your progress will be saved, but generation will stop. 
            You'll need to resume generation when you return.
          </p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setShowLeaveWarning(false)} 
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Continue Generation
            </button>
            <button 
              onClick={confirmLeave} 
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
            >
              Stop & Go Back
            </button>
          </div>
        </div>
      </Modal>

      {/* Back navigation confirmation */}
      <Modal
        isOpen={showBackConfirmation && !isGenerating}
        onClose={() => setShowBackConfirmation(false)}
        title="Return to Previous Step?"
      >
        <div className="p-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <ArrowLeft className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {completedChapters === chapterTitlesArray.length ? 
              "All chapters are generated" : 
              "Some chapters are not complete"}
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            {completedChapters === chapterTitlesArray.length ?
              "Your content is ready. If you go back, you can edit the summary but will need to regenerate chapters." :
              "If you go back, your progress will be saved, but you'll need to return to this page to continue generation."
            }
          </p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setShowBackConfirmation(false)} 
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Stay on This Page
            </button>
            <button 
              onClick={confirmLeave} 
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Return 
            </button>
          </div>
        </div>
      </Modal>

      {/* Save success modal */}
      <Modal
        isOpen={showSaveSuccessModal}
        onClose={goToDashboard}
        title="Content Saved Successfully!"
      >
        <div className="p-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your {contentCategory === 'book' ? 'book' : 'course'} has been saved!
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            "{title}" is now available in your dashboard where you can further edit, publish, or share it.
          </p>
          <button 
            onClick={goToDashboard}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            Go to My Dashboard
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ContentGenerationViewer;