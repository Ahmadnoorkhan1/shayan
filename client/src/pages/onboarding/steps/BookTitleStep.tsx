"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, FileText, Check, RefreshCw, PenSquare, SendHorizontal, Sparkles } from "lucide-react"
import { ContentData } from "../ContentGenerationStepper"
import apiService from "../../../utilities/service/api"

interface ContentTitleStepProps {
  bookData: ContentData
  selectedTitle: string
  onSelect: (title: string) => void
}

const ContentTitleStep: React.FC<ContentTitleStepProps> = ({ bookData, selectedTitle, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titles, setTitles] = useState<string[]>([])
  const [animatedTitles, setAnimatedTitles] = useState<string[]>([])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showCustomField, setShowCustomField] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  
  // New states for prompt-first approach
  const [titlePrompt, setTitlePrompt] = useState("")
  const [promptEntered, setPromptEntered] = useState(false)
  
  // Use a ref to track if initial fetch has happened
  const initialFetchDone = useRef(false)

  // Color variants for cards
  const colorVariants = [
    'from-blue-400 to-blue-500',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-500',
    'from-teal-400 to-teal-500',
    'from-amber-400 to-amber-500',
    'from-emerald-400 to-emerald-500',
    'from-rose-400 to-rose-500',
    'from-cyan-400 to-cyan-500',
    'from-violet-400 to-violet-500',
    'from-indigo-400 to-indigo-500',
  ];

  const fetchTitlesFromAPI = async (isInitialFetch = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call the API to generate titles with the user's prompt
      const response = await apiService.post("/onboard/generate-titles", {
        contentType: bookData.purpose,
        details: bookData.details,
        prompt: titlePrompt, // Include the user's prompt
        count: 9 // Request 9 title suggestions (fits better in 3x3 grid)
      });

      if (response.success && response.data) {
        // The API returns titles in the data array directly
        const generatedTitles = Array.isArray(response.data) ? response.data : [];
        
        // Clean up titles (remove quotes if present)
        const cleanTitles = generatedTitles.map((title:any) => 
          title.replace(/^["'](.*)["']$/, '$1')
        );
        
        setTitles(cleanTitles);

        // Animate titles appearing one by one
        setAnimatedTitles([]);
        const animateInterval = setInterval(() => {
          setAnimatedTitles((prev) => {
            if (prev.length >= cleanTitles.length) {
              clearInterval(animateInterval);
              return prev;
            }
            return [...prev, cleanTitles[prev.length]];
          });
        }, 200);
      } else {
        throw new Error(response.message || "Failed to generate titles");
      }
    } catch (err) {
      console.error("Error generating titles:", err);
      setError(err instanceof Error ? err.message : "Failed to generate titles");
      
      // Set some fallback titles in case of error
      const fallbackTitles = [
        "Your New " + (bookData.purpose || "Content"),
        "Untitled " + (bookData.purpose || "Project"),
        "Custom " + (bookData.purpose || "Content") + " Creation",
        (bookData.details.style || "Personalized") + " " + (bookData.purpose || "Publication"),
        "My " + (bookData.details.audience || "Personal") + " " + (bookData.purpose || "Project"),
        (bookData.details.tone || "Professional") + " " + (bookData.purpose || "Content"),
      ];
      
      setTitles(fallbackTitles);
      setAnimatedTitles(fallbackTitles);
    } finally {
      setIsLoading(false);
      if (isInitialFetch) {
        initialFetchDone.current = true;
      }
    }
  };

  // Handle prompt submission
  const handlePromptSubmit = () => {
    if (titlePrompt.trim()) {
      setPromptEntered(true);
      fetchTitlesFromAPI(true);
    }
  };

  // Handle title selection
  const handleTitleSelect = (title: string) => {
    // Prevent re-renders and API calls by checking if it's already selected
    if (title !== selectedTitle) {
      onSelect(title);
      setCustomTitle(title); // Also update custom title field if it's visible
    }
  };

  // Handle custom title submission
  const handleCustomTitleSubmit = () => {
    if (customTitle.trim()) {
      handleTitleSelect(customTitle);
    }
  };

  // Handle enter key press in inputs
  const handleKeyPress = (e: React.KeyboardEvent, actionType: 'prompt' | 'custom') => {
    if (e.key === 'Enter') {
      if (actionType === 'prompt' && titlePrompt.trim()) {
        handlePromptSubmit();
      } else if (actionType === 'custom' && customTitle.trim()) {
        handleCustomTitleSubmit();
      }
    }
  };

  // Reset to prompt input
  const handleResetPrompt = () => {
    setPromptEntered(false);
    setTitles([]);
    setAnimatedTitles([]);
    initialFetchDone.current = false;
  };

  // Render prompt input screen
  if (!promptEntered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto px-4 animate-fadeIn">
        <div className="w-full bg-white rounded-xl border border-purple-100 shadow-lg p-8 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            What kind of title are you looking for?
          </h2>
          
          {/* <p className="text-gray-600 mb-8 text-center">
            Provide a brief description or keywords to help our AI generate title suggestions for your {bookData.purpose.toLowerCase()}.
          </p> */}
          
          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={titlePrompt}
                onChange={(e) => setTitlePrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleKeyPress(e, 'prompt')}
                placeholder={`e.g., "A ${bookData.purpose.toLowerCase()} about space exploration for beginners" or "Something catchy with the keywords: investment, future, technology"`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                        outline-none text-gray-900 bg-gray-50 hover:bg-white
                        transition-all duration-200 h-32 resize-none"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                Ctrl+Enter to submit
              </div>
            </div>
            
            <button
              onClick={handlePromptSubmit}
              disabled={!titlePrompt.trim()}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg transition-all duration-300 font-medium
                        transform hover:shadow-lg ${
                          titlePrompt.trim() 
                            ? 'bg-purple-600 text-white hover:-translate-y-0.5 active:translate-y-0' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
            >
              <Sparkles size={18} className={isLoading ? "animate-pulse" : ""} />
              Generate Title Suggestions
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>You'll be able to edit or create your own title after seeing suggestions.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-600 blur-lg opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        </div>
        <p className="text-gray-600 mt-6 text-center max-w-md">
          Our AI is crafting titles based on your prompt: "{titlePrompt}"...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <button
          onClick={handleResetPrompt}
          className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-200 flex items-center gap-1"
        >
          <span>« Change Prompt</span>
        </button>
        
        {/* Regenerate button */}
        <button
          onClick={() => fetchTitlesFromAPI(false)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-200"
          disabled={isLoading}
          title="Generate new title suggestions"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 w-full">
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-1">We've provided some fallback titles below. You can try regenerating or choose from these options.</p>
        </div>
      )}

      {/* Current prompt display */}
      <div className="w-full px-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-sm text-purple-700">
            <span className="font-medium">Your prompt:</span> {titlePrompt}
          </p>
        </div>
      </div>

      {/* Title cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full px-4 py-6 animate-fadeIn">
        {animatedTitles.map((title, index) => {
          const colorClass = colorVariants[index % colorVariants.length];
          const isHovered = hoverIndex === index;
          const isSelected = selectedTitle === title;
          
          return (
            <button
              key={index}
              className={`
                group relative shadow-md h-32 bg-white border rounded-lg 
                transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden
                ${isSelected ? 'border-purple-400 shadow-lg ring-1 ring-purple-400' : 'border-gray-200 hover:shadow-lg'}
              `}
              onClick={() => handleTitleSelect(title)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300
                  ${isSelected ? 'from-purple-50 to-white opacity-100' : 'from-gray-50 to-white opacity-100'}
                  ${isHovered ? 'opacity-0' : 'opacity-100'}`}
              ></div>
              
              {/* Accent line at top with animated width */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                  isSelected ? 'from-purple-400 to-purple-600' : colorClass
                } transition-all duration-300 ease-out`}
                style={{ 
                  width: isHovered || isSelected ? '100%' : '40%',
                  left: 0,
                  opacity: isHovered || isSelected ? 1 : 0.7
                }}
              ></div>
              
              {/* Content with subtle animation */}
              <div className="relative h-full flex flex-col items-center justify-center p-4 z-10">
                <h3 
                  className="text-base font-medium text-center transition-all duration-300 ease-in-out"
                  style={{ 
                    transform: isHovered || isSelected ? 'scale(1.05)' : 'scale(1)',
                    color: isSelected ? '#6b46c1' : isHovered ? '#000000' : '#1f2937'
                  }}
                >
                  {title}
                </h3>
              </div>
              
              {/* Bottom accent line with animation */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  isSelected ? 'from-purple-400 to-purple-600' : colorClass
                } transition-all duration-500 ease-in-out`}
                style={{ 
                  width: isHovered || isSelected ? '100%' : '0%',
                  opacity: isHovered || isSelected ? 0.8 : 0
                }}
              ></div>
              
              {/* Corner decoration */}
              <div 
                className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl transition-all duration-500 ease-in-out"
                style={{
                  background: isHovered || isSelected ? 
                    'linear-gradient(to top left, rgba(107, 70, 193, 0.1), transparent)' : 'transparent',
                  transform: isHovered || isSelected ? 'scale(1)' : 'scale(0)',
                  opacity: isHovered || isSelected ? 1 : 0
                }}
              ></div>
              
              {/* Check indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom title input */}
      <div className="w-full max-w-lg mt-6 mb-8 px-4">
        {!showCustomField ? (
          <button 
            onClick={() => setShowCustomField(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 
                    rounded-lg text-gray-700 hover:text-purple-600 hover:border-purple-300 
                    hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <PenSquare size={18} />
            <span className="font-medium">Create your own title</span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 p-5 bg-white rounded-lg border border-gray-300 
                        shadow-sm hover:shadow-md transition-all duration-300">
            <label htmlFor="custom-title" className="text-sm font-semibold text-gray-800">
              Enter your own title:
            </label>
            
            <input
              id="custom-title"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'custom')}
              placeholder={`Enter a title for your ${bookData.purpose.toLowerCase()}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
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
                            ? 'bg-purple-600 text-white hover:-translate-y-0.5 active:translate-y-0' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
            >
              Use This Title
            </button>
          </div>
        )}
      </div>

      {/* Add fadeIn animation to stylesheet */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ContentTitleStep;