"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Loader2, FileText, Check, RefreshCw } from "lucide-react"
import { ContentData } from "../BookGenerationStepper"
import apiService from "../../../utilities/service/api"

interface ContentTitleStepProps {
  bookData: ContentData
  selectedTitle: string
  onSelect: (title: string) => void
}

const ContentTitleStep: React.FC<ContentTitleStepProps> = ({ bookData, selectedTitle, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [titles, setTitles] = useState<string[]>([])
  const [animatedTitles, setAnimatedTitles] = useState<string[]>([])
  
  // Use a ref to track if initial fetch has happened
  const initialFetchDone = useRef(false)

  const fetchTitlesFromAPI = async (isInitialFetch = false) => {
    // Don't fetch if we're deliberately selecting a title
    if (!isInitialFetch && selectedTitle && !isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      // Call the API to generate titles
      const response = await apiService.post("/onboard/generate-titles", {
        contentType: bookData.purpose,
        details: bookData.details,
        count: 6 // Request 6 title suggestions
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
        }, 300);
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

  // Fetch titles only on initial mount or when refresh is requested
  useEffect(() => {
    // Only fetch if we haven't done the initial fetch yet
    if (!initialFetchDone.current) {
      fetchTitlesFromAPI(true);
    }
  }, []); // Empty dependency array - only run on mount

  // Handle title selection
  const handleTitleSelect = (title: string) => {
    // Prevent re-renders and API calls by checking if it's already selected
    if (title !== selectedTitle) {
      onSelect(title);
    }
  };

  if (isLoading && !initialFetchDone.current) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-600 blur-lg opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        </div>
        <p className="text-gray-600 mt-6 text-center max-w-md">
          Our AI is crafting the perfect titles based on your content's purpose and details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="mr-4 mt-1 bg-white p-2 rounded-lg shadow-sm">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800 mb-1">AI-Generated Title Suggestions</h3>
              <p className="text-sm text-gray-600">
                Based on your selections, our AI has generated these title suggestions for your {bookData.purpose} content. 
                Choose one that resonates with your vision.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => fetchTitlesFromAPI(false)}
            disabled={isLoading}
            className="flex items-center justify-center p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-colors"
            title="Generate new suggestions"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-1">We've provided some fallback titles below. You can try regenerating or choose from these options.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {animatedTitles.map((title, index) => (
          <div
            key={index}
            className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 animate-fadeIn ${
              selectedTitle === title
                ? "border-purple-400 bg-gradient-to-r from-purple-50 to-white shadow-md"
                : "border-gray-200 hover:border-purple-200 hover:shadow-sm bg-white"
            }`}
            onClick={() => handleTitleSelect(title)}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-medium text-lg ${selectedTitle === title ? "text-purple-800" : "text-gray-800"}`}>
                {title}
              </h3>

              {selectedTitle === title && (
                <div className="bg-purple-600 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {titles.length === 0 && !isLoading && (
        <div className="text-center p-8">
          <p className="text-gray-500">No titles were generated. Please try again or enter a custom title.</p>
          <button
            onClick={() => fetchTitlesFromAPI(false)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Option to enter custom title */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="font-medium text-gray-700 mb-2">Or enter your own title:</h3>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Enter a custom title..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
            value={selectedTitle && !titles.includes(selectedTitle) ? selectedTitle : ""}
            onChange={(e) => handleTitleSelect(e.target.value)}
          />
          <button
            onClick={() => {
              if (selectedTitle && !titles.includes(selectedTitle)) return;
              const input = document.querySelector('input') as HTMLInputElement;
              if (input && input.value) handleTitleSelect(input.value);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Use This
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentTitleStep;