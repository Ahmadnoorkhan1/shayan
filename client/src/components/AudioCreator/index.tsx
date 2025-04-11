import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../ui/button";
import apiService from "../../utilities/service/api";
import { Play, Pause, SkipForward, SkipBack, Music, Check, Download, ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

// Get the API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5002'
  : 'https://minilessonsacademy.onrender.com';

interface AudioGenerationStatus {
  chapterId: number;
  title: string;
  status: "idle" | "loading" | "success" | "error";
  audioUrl?: string;
  error?: string;
}

interface AudioData {
  path: string;
  createdAt: string;
  voice: string;
  duration: number;
}

interface ChaptersWithAudio {
  [chapterIndex: string]: AudioData;
}

interface ExistingAudio {
  chapterIndex: number;
  audioUrl: string;
  voice?: string;
  duration?: number;
  createdAt?: string;
}

const AudioCreator: React.FC = () => {
  const { contentType, id } = useParams<{ contentType: string; id: string }>();
  const [chapters, setChapters] = useState<string[]>([]);
  const [chapterDetails, setChapterDetails] = useState<{ title: string; content: string }[]>([]);
  const [generationStatus, setGenerationStatus] = useState<AudioGenerationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [existingAudios, setExistingAudios] = useState<ExistingAudio[]>([]);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const audioRefs = useRef<{[key: number]: HTMLAudioElement | null}>({});
  const navigate = useNavigate();
  
  // Helper function to get full URL for audio files
  const getFullAudioUrl = (path: string) => {
    if (path.startsWith('http')) return path; // Already a full URL
    return `${API_BASE_URL}${path}`;
  };
  
  // Voice options
  const voiceOptions = [
    { id: "alloy", name: "Alloy (Balanced)" },
    { id: "echo", name: "Echo (Soft)" },
    { id: "fable", name: "Fable (Expressive)" },
    { id: "onyx", name: "Onyx (Deep)" },
    { id: "nova", name: "Nova (Clear)" },
    { id: "shimmer", name: "Shimmer (Bright)" }
  ];

  // Fetch both content and existing audio files
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchingExisting(true);
        
        // First fetch the content
        const endpoint = contentType === "book" 
          ? `/book-creator/getBookById/${id}`
          : `/course-creator/getCourseById/${id}/course`;
        
        const contentResponse = await apiService.get(endpoint, {});
        
        // Then fetch any existing audio files
        const audioEndpoint = `/audio/chapters/${contentType}/${id}`;
        const audioResponse = await apiService.get(audioEndpoint, {})
          .catch(err => {
            console.warn("Could not fetch existing audio files:", err);
            return { success: false, data: {} };
          });
        
        // Process content response
        if (contentResponse.success && contentResponse.data?.content) {
          let parsedChapters: string[] = [];
          
          try {
            // Clean and parse the content based on its format
            const cleanContent = contentResponse.data.content
              .replace(/^"/, '')
              .replace(/"$/, '')
              .replace(/\\\\/g, '\\')
              .replace(/\\"/g, '"');
              
            let parsed = JSON.parse(cleanContent);
            
            // Handle different content formats
            if (typeof parsed === "string") {
              parsed = JSON.parse(parsed);
            }
            
            parsedChapters = Array.isArray(parsed) ? parsed : [parsed];
            
            // Filter out cover images 
            parsedChapters = parsedChapters.filter(chapter => 
              !chapter.includes('data-cover="true"') && 
              !chapter.includes('book-cover-image')
            );
            
            setChapters(parsedChapters);
            
            // Parse chapter titles and content
            const details = parsedChapters.map((chapter, index) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(chapter, 'text/html');
              
              // Find the title (usually in h1)
              const titleElement = doc.querySelector('h1');
              const title = titleElement?.textContent || `Chapter ${index + 1}`;
              
              // ENHANCED: More comprehensive quiz removal
              // 1. Remove visible quiz sections (h2 Exercises)
              const quizSections = doc.querySelectorAll('h2');
              quizSections.forEach(section => {
                if (section.textContent?.trim().toLowerCase() === 'exercises') {
                  let currentNode = section as any;
                  const nodesToRemove = [];
                  nodesToRemove.push(currentNode);
                  
                  while (currentNode.nextElementSibling) {
                    currentNode = currentNode.nextElementSibling;
                    nodesToRemove.push(currentNode);
                    if (currentNode.tagName === 'H2') break;
                  }
                  
                  nodesToRemove.forEach(node => {
                    if (node.parentNode) node.parentNode.removeChild(node);
                  });
                }
              });
              
              // 2. Remove any shared quiz content in comments
              let htmlContent = doc.body.innerHTML;
              htmlContent = htmlContent
                .replace(/<!-- SHARED_QUIZ_START -->[\s\S]*?<!-- SHARED_QUIZ_END -->/g, '')
                .replace(/<!-- quiz data:[\s\S]*?-->/g, '')
                .replace(/<div class="quiz-container"[\s\S]*?<\/div>/g, '');
                
              // Set the cleaned HTML back to the document
              doc.body.innerHTML = htmlContent;
              
              // Get the plain text content
              const content = doc.body.textContent || "";
              
              return { title, content };
            });
            
            setChapterDetails(details);
            
            // Process existing audio files if available
            if (audioResponse.success && audioResponse.data?.chaptersWithAudio) {
              const chaptersWithAudio = audioResponse.data.chaptersWithAudio;
              
              // Convert the object format to our expected array format
              const existingAudiosArray: ExistingAudio[] = Object.entries(chaptersWithAudio).map(
                ([index, data]: [string, any]) => ({
                  chapterIndex: Number(index),
                  audioUrl: getFullAudioUrl(data.path),
                  voice: data.voice,
                  duration: data.duration,
                  createdAt: data.createdAt
                })
              );
              
              setExistingAudios(existingAudiosArray);
              
              // Initialize generation status with existing audio files
              const initialStatus = details.map((chapter, index) => {
                const existingAudio = existingAudiosArray.find(audio => 
                  audio.chapterIndex === index
                );
                
                return {
                  chapterId: index,
                  title: chapter.title,
                  status: existingAudio ? "success" : "idle",
                  audioUrl: existingAudio?.audioUrl
                };
              });
              
              setGenerationStatus(initialStatus as any);
            } else {
              // Initialize generation status without existing files
              setGenerationStatus(details.map((chapter, index) => ({
                chapterId: index,
                title: chapter.title,
                status: "idle"
              })));
            }
            
          } catch (e) {
            console.error(`Error parsing ${contentType} content:`, e);
            setError(`Failed to parse ${contentType} content`);
            
            // Initialize empty generation status
            setGenerationStatus([]);
          }
        } else {
          setError(`Failed to fetch ${contentType} data`);
        }
      } catch (err: any) {
        setError(err.message || `Error fetching ${contentType} data`);
      } finally {
        setLoading(false);
        setFetchingExisting(false);
      }
    };

    if (id && contentType) {
      fetchData();
    }
  }, [id, contentType]);

  const refreshExistingAudio = async () => {
    try {
      setFetchingExisting(true);
      const audioEndpoint = `/audio/chapters/${contentType}/${id}`;
      const response = await apiService.get(audioEndpoint, {});
      
      if (response.success && response.data?.chaptersWithAudio) {
        const chaptersWithAudio = response.data.chaptersWithAudio;
        
        // Convert the object format to our expected array format
        const existingAudiosArray: ExistingAudio[] = Object.entries(chaptersWithAudio).map(
          ([index, data]: [string, any]) => ({
            chapterIndex: Number(index),
            audioUrl: getFullAudioUrl(data.path),
            voice: data.voice,
            duration: data.duration,
            createdAt: data.createdAt
          })
        );
        
        setExistingAudios(existingAudiosArray);
        
        // Update generation status with newly fetched audio files
        setGenerationStatus(prev => {
          const updated = [...prev];
          
          existingAudiosArray.forEach((audio) => {
            const index = audio.chapterIndex;
            if (index >= 0 && index < updated.length) {
              updated[index] = {
                ...updated[index],
                status: "success",
                audioUrl: audio.audioUrl
              };
            }
          });
          
          return updated;
        });
        
        toast.success("Audio files refreshed successfully");
      }
    } catch (err) {
      console.error("Error refreshing audio files:", err);
      toast.error("Failed to refresh audio files");
    } finally {
      setFetchingExisting(false);
    }
  };

  const generateChapterAudio = async (chapterIndex: number) => {
    // Update status to loading
    setGenerationStatus(prev => {
      const updated = [...prev];
      updated[chapterIndex] = {
        ...updated[chapterIndex],
        status: "loading"
      };
      return updated;
    });
    
    try {
      const TypeCheck = contentType === "book" ? "book" : "course";
      // Make API call to generate audio for this chapter
      const response = await apiService.post(
        `/audio/generate-chapter/${id}/${contentType}`,
        {
          chapterIndex: chapterIndex,
          chapterContent: chapterDetails[chapterIndex].content,
          voice: selectedVoice,
          type: TypeCheck,
          id: id
        },
        { timeout: 120000 } // 2 minute timeout to accommodate longer processing
      );
      
      if (response.success) {
        // Handle different response formats
        const audioPath = response.data?.audioPath || response.data?.audioUrl;
        
        if (audioPath) {
          const fullAudioUrl = getFullAudioUrl(audioPath);
          
          // Update status with successful result
          setGenerationStatus(prev => {
            const updated = [...prev];
            updated[chapterIndex] = {
              ...updated[chapterIndex],
              status: "success",
              audioUrl: fullAudioUrl
            };
            return updated;
          });
          
          // Update existing audios list
          setExistingAudios(prev => {
            const updated = [...prev];
            const index = updated.findIndex(a => a.chapterIndex === chapterIndex);
            
            if (index >= 0) {
              // Update existing entry
              updated[index].audioUrl = fullAudioUrl;
            } else {
              // Add new entry
              updated.push({
                chapterIndex,
                audioUrl: fullAudioUrl,
                voice: selectedVoice,
                createdAt: new Date().toISOString()
              });
            }
            
            return updated;
          });
          
          toast.success(`Audio for ${chapterDetails[chapterIndex].title} generated successfully!`);
          return true;
        }
      }
      
      throw new Error(response.message || "Failed to generate audio");
    } catch (err: any) {
      console.error(`Error generating audio for chapter ${chapterIndex}:`, err);
      
      // Update status with error
      setGenerationStatus(prev => {
        const updated = [...prev];
        updated[chapterIndex] = {
          ...updated[chapterIndex],
          status: "error",
          error: err.message || "Failed to generate audio"
        };
        return updated;
      });
      
      toast.error(`Failed to generate audio: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  const handlePlay = (chapterIndex: number) => {
    // Stop any currently playing audio
    if (currentlyPlaying !== null && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying]?.pause();
    }
    
    // Play the selected chapter
    if (audioRefs.current[chapterIndex]) {
      audioRefs.current[chapterIndex]?.play();
      setCurrentlyPlaying(chapterIndex);
    }
  };

  const handlePause = (chapterIndex: number) => {
    if (audioRefs.current[chapterIndex]) {
      audioRefs.current[chapterIndex]?.pause();
      setCurrentlyPlaying(null);
    }
  };

  const handleAudioEnded = () => {
    setCurrentlyPlaying(null);
  };
  
  

  // Calculate overall progress
  const generatedCount = generationStatus.filter(s => s.status === "success").length;
  const errorCount = generationStatus.filter(s => s.status === "error").length;
  const totalProgress = chapterDetails.length ? Math.round((generatedCount / chapterDetails.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="relative">
          <Music className="w-12 h-12 text-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">Loading content...</h3>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your audio generation</p>
        <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Editor
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </button>
          <h1 className="text-2xl font-bold">Create Audio {contentType === "book" ? "Book" : "Course"}</h1>
          <p className="text-gray-600 mt-1">Generate and manage audio for your {contentType}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Voice selection dropdown */}
          <div>
            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-1">
              Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 text-sm"
              disabled={isGenerating}
            >
              {voiceOptions.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Refresh button */}
          <Button
            // variant="outline"
            // size="sm"
            onClick={refreshExistingAudio}
            disabled={fetchingExisting}
            className="flex text-white items-center bg-gradient-to-tl gap-1 h-10"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingExisting ? "animate-spin" : ""}`} />
            <span>{fetchingExisting ? "Refreshing..." : "Refresh Audio Files"}</span>
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>Overall Progress</span>
          <span>{generatedCount} of {chapterDetails.length} chapters ({totalProgress}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
        {errorCount > 0 && (
          <p className="text-sm text-red-500 mt-1">
            {errorCount} chapter{errorCount > 1 ? 's' : ''} failed to generate
          </p>
        )}
      </div>
      
      {/* Chapters list */}
      <div className="space-y-4">
        {chapterDetails.map((chapter, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-4 ${
              generationStatus[index]?.status === "error" ? "border-red-200 bg-red-50" : 
              generationStatus[index]?.status === "success" ? "border-green-200 bg-green-50" : 
              generationStatus[index]?.status === "loading" ? "border-blue-200 bg-blue-50" : 
              "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-medium text-lg">{chapter.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {chapter.content.length > 100 ? 
                    `${chapter.content.substring(0, 100)}...` : 
                    chapter.content}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {(!generationStatus[index] || generationStatus[index]?.status === "idle") && (
                  <Button
                    // variant="outline"
                    // size="sm"
                    onClick={() => generateChapterAudio(index)}
                    disabled={isGenerating}
                    className="flex text-white items-center bg-gradient-to-tl gap-1 h-10"
                  >
                    <Music className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                )}
                
                {generationStatus[index]?.status === "loading" && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Generating...
                  </div>
                )}
                
                {generationStatus[index]?.status === "error" && (
                  <div className="flex items-center">
                    <span className="text-red-500 text-sm mr-2">{generationStatus[index]?.error}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateChapterAudio(index)}
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                
             
              </div>
            </div>
            
            {/* Show audio player UI when generated successfully */}
            {generationStatus[index]?.status === "success" && generationStatus[index]?.audioUrl && (
              <div className="mt-3">
                <audio
                  controls
                  className="w-full mt-2"
                  src={generationStatus[index].audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {chapterDetails.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No chapters found</h3>
          <p className="text-gray-500 mt-1">This {contentType} doesn't have any chapters to convert to audio.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Return to Editor
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioCreator;