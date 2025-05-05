import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../ui/button";
import apiService from "../../utilities/service/api";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Check,
  Download,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
  FileAudio,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

// Get the API base URL based on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://minilessonsacademy.onrender.com";

// Using function declaration to avoid "cons" linter error
function createSocketConnection() {
  return io(API_BASE_URL, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false // Don't connect immediately, we'll handle it manually
  });
}

const socket = createSocketConnection();

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

interface CompleteAudioStatus {
  status: "idle" | "loading" | "success" | "error";
  url?: string;
  error?: string;
}

const AudioCreator: React.FC = () => {
  const { contentType, id } = useParams<{ contentType: string; id: string }>();
  const [audio, setAudio] = useState<string[]>([]);
  const [oldAudio, setOldAudio] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [chapterDetails, setChapterDetails] = useState<
    { title: string; content: string }[]
  >([]);
  const [generationStatus, setGenerationStatus] = useState<
    AudioGenerationStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [existingAudios, setExistingAudios] = useState<ExistingAudio[]>([]);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [hasAudio,setHasAudio] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<
    number | null
  >(null);
  const [completeAudioStatus, setCompleteAudioStatus] =
    useState<CompleteAudioStatus>({ status: "idle" });
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const navigate = useNavigate();
  const [chapterProgress, setChapterProgress] = useState<{[key: number]: number}>({});
  const [socketConnected, setSocketConnected] = useState(false);

  // Helper function to get full URL for audio files
  const getFullAudioUrl = (path: string) => {
    if (path.startsWith("http")) return path; // Already a full URL
    return `${API_BASE_URL}${path}`;
  };

  // Voice options
  const voiceOptions = [
    { id: "alloy", name: "Alloy (Balanced)" },
    { id: "echo", name: "Echo (Soft)" },
    { id: "fable", name: "Fable (Expressive)" },
    { id: "onyx", name: "Onyx (Deep)" },
    { id: "nova", name: "Nova (Clear)" },
    { id: "shimmer", name: "Shimmer (Bright)" },
  ];

  // Fetch both content and existing audio files
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchingExisting(true);

        // First fetch the content
        const endpoint =
          contentType === "book"
            ? `/book-creator/getBookById/${id}`
            : `/course-creator/getCourseById/${id}/course`;

        const contentResponse = await apiService.get(endpoint, {});
        if(contentResponse?.data?.audios ){
          const parsedAudio = JSON.parse(contentResponse?.data?.audios);
          console.log(parsedAudio, ' <<<<<    ')
          if(Object.entries(parsedAudio).length > 0){
            setAudio(parsedAudio)
          }else{
            setAudio([]);
          }
        }else{
          console.log(">>>>>>>>>",contentResponse?.data?.audios)
          setAudio(contentResponse?.data?.audios)
        }
        // Then fetch any existing audio files
        const audioEndpoint = `/audio/chapters/${contentType}/${id}`;
        const audioResponse = await apiService
          .get(audioEndpoint, {})
          .catch((err) => {
            console.warn("Could not fetch existing audio files:", err);
            return { success: false, data: {} };
          });
        // Process content response
        if (contentResponse.success && contentResponse.data?.content) {
          let parsedChapters: string[] = [];

          try {
            let parsed = JSON.parse(contentResponse.data?.content);

            // Handle different content formats
            if (typeof parsed === "string") {
              parsed = JSON.parse(parsed);
            }

            parsedChapters = Array.isArray(parsed) ? parsed : [parsed];
            
            // Filter out cover images
            parsedChapters = parsedChapters?.filter((chapter) => {
              if (typeof chapter === "string") {
                return (
                  !chapter.includes('data-cover="true"') &&
                  !chapter.includes("book-cover-image")
                );
              } else {
                return chapter;
              }

            });

            setChapters(parsedChapters);

            // Parse chapter titles and content
            const details = parsedChapters.map((chapter: any, index) => {
              if (typeof chapter === "string") {
                const parser = new DOMParser();
                const doc = parser.parseFromString(chapter, "text/html");

                // Find the title (usually in h1)
                const titleElement = doc.querySelector("h1");
                const title =
                  titleElement?.textContent || `Chapter ${index + 1}`;

                // ENHANCED: More comprehensive quiz removal
                // 1. Remove visible quiz sections (h2 Exercises)
                const quizSections = doc.querySelectorAll("h2");
                quizSections.forEach((section) => {
                  if (
                    section.textContent?.trim().toLowerCase() === "exercises"
                  ) {
                    let currentNode = section as any;
                    const nodesToRemove = [];
                    nodesToRemove.push(currentNode);

                    while (currentNode.nextElementSibling) {
                      currentNode = currentNode.nextElementSibling;
                      nodesToRemove.push(currentNode);
                      if (currentNode.tagName === "H2") break;
                    }

                    nodesToRemove.forEach((node) => {
                      if (node.parentNode) node.parentNode.removeChild(node);
                    });
                  }
                });

                // 2. Remove any shared quiz content in comments
                let htmlContent = doc.body.innerHTML;
                htmlContent = htmlContent
                  .replace(
                    /<!-- SHARED_QUIZ_START -->[\s\S]*?<!-- SHARED_QUIZ_END -->/g,
                    ""
                  )
                  .replace(/<!-- quiz data:[\s\S]*?-->/g, "")
                  .replace(/<div class="quiz-container"[\s\S]*?<\/div>/g, "");

                // Set the cleaned HTML back to the document
                doc.body.innerHTML = htmlContent;

                // Get the plain text content
                const content = doc.body.textContent || "";

                return { title, content };
              } else {
                const parser = new DOMParser();
                const doc = parser.parseFromString(chapter.content, "text/html");

                // Find the title (usually in h1)
                const titleElement = doc.querySelector("h1");
                const title =
                  titleElement?.textContent || `Chapter ${index + 1}`;

                // ENHANCED: More comprehensive quiz removal
                // 1. Remove visible quiz sections (h2 Exercises)
                const quizSections = doc.querySelectorAll("h2");
                quizSections.forEach((section) => {
                  if (
                    section.textContent?.trim().toLowerCase() === "exercises"
                  ) {
                    let currentNode = section as any;
                    const nodesToRemove = [];
                    nodesToRemove.push(currentNode);

                    while (currentNode.nextElementSibling) {
                      currentNode = currentNode.nextElementSibling;
                      nodesToRemove.push(currentNode);
                      if (currentNode.tagName === "H2") break;
                    }

                    nodesToRemove.forEach((node) => {
                      if (node.parentNode) node.parentNode.removeChild(node);
                    });
                  }
                });

                // 2. Remove any shared quiz content in comments
                let htmlContent = doc.body.innerHTML;
                htmlContent = htmlContent
                  .replace(
                    /<!-- SHARED_QUIZ_START -->[\s\S]*?<!-- SHARED_QUIZ_END -->/g,
                    ""
                  )
                  .replace(/<!-- quiz data:[\s\S]*?-->/g, "")
                  .replace(/<div class="quiz-container"[\s\S]*?<\/div>/g, "");

                // Set the cleaned HTML back to the document
                doc.body.innerHTML = htmlContent;

                // Get the plain text content
                const content = doc.body.textContent || "";
                return {
                  title: chapter.title,
                  content: content,
                };
              }
            });

            setChapterDetails(details);

            // Process existing audio files if available
            if (
              audioResponse.success &&
              audioResponse.data?.chaptersWithAudio
            ) {
              const chaptersWithAudio = audioResponse.data.chaptersWithAudio;
              setHasAudio(audioResponse.data.hasAudio);
              // Convert the object format to our expected array format
              const existingAudiosArray: ExistingAudio[] = Object.entries(
                chaptersWithAudio
              ).map(([index, data]: [string, any]) => ({
                chapterIndex: Number(index),
                audioUrl: getFullAudioUrl(data.path),
                voice: data.voice,
                duration: data.duration,
                createdAt: data.createdAt,
              }));

              setExistingAudios(existingAudiosArray);

              // Initialize generation status with existing audio files
              const initialStatus = details.map((chapter, index) => {
                const existingAudio = existingAudiosArray.find(
                  (audio) => audio.chapterIndex === index
                );

                return {
                  chapterId: index,
                  title: chapter.title,
                  status: existingAudio ? "success" : "idle",
                  audioUrl: existingAudio?.audioUrl,
                };
              });

              setGenerationStatus(initialStatus as any);
            } else {
              // Initialize generation status without existing files
              setGenerationStatus(
                details.map((chapter, index) => ({
                  chapterId: index,
                  title: chapter.title,
                  status: "idle",
                }))
              );
            }
          } catch (e) {
            console.error(`Error parsing ${contentType} content:`, e);
            setError(`Failed to parse ${contentType} content`);

            // Initialize empty generation status
            setGenerationStatus([]);
          }
        } else {
          const blobResponse = await apiService.post(
            "/course-creator/convert-blob-to-chapters",
            {
              blobUrl: contentResponse?.data?.blob_location,
            }
          );

          if (blobResponse.success) {
            // Update the course with the new content
            const updateResponse = await apiService.post(
              `/course-creator/updateCourse/${id}/course`,
              {
                content: JSON.stringify(blobResponse.data.chapters),
              }
            );

            console.log(updateResponse, "==================>updated");
          }

          // setError(`Failed to fetch ${contentType} data`);
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

  useEffect(() => {
    const courseId = id
    const chapterTitles = chapterDetails.length && chapterDetails.map((chapter) => chapter.title);
    const getAudio = async () => {
      const audios = await apiService.post(
        `course-creator/audio/${courseId}`, {
          chapters:chapterTitles
        }
      );
      console.log('************************')
      console.log('audios ',audios?.data?.audios)
      console.log('************************')
      if(audios?.data?.audios){
        if(typeof(audios?.data?.audios)==='string'){
          const parsedAudio = JSON.parse(audios?.data?.audios)
          setOldAudio(parsedAudio)
        }else{
          setOldAudio(audios?.data?.audios)
        }
      }
    };

    if(!audio){
      getAudio();
    }
    
  }, [chapterDetails, hasAudio]);

  const refreshExistingAudio = async () => {
    try {
      setFetchingExisting(true);
      const audioEndpoint = `/audio/chapters/${contentType}/${id}`;
      const response = await apiService.get(audioEndpoint, {});

      if (response.success && response.data?.chaptersWithAudio) {
        const chaptersWithAudio = response.data.chaptersWithAudio;

        // Convert the object format to our expected array format
        const existingAudiosArray: ExistingAudio[] = Object.entries(
          chaptersWithAudio
        ).map(([index, data]: [string, any]) => ({
          chapterIndex: Number(index),
          audioUrl: getFullAudioUrl(data.path),
          voice: data.voice,
          duration: data.duration,
          createdAt: data.createdAt,
        }));

        setExistingAudios(existingAudiosArray);

        // Update generation status with newly fetched audio files
        setGenerationStatus((prev) => {
          const updated = [...prev];

          existingAudiosArray.forEach((audio) => {
            const index = audio.chapterIndex;
            if (index >= 0 && index < updated.length) {
              updated[index] = {
                ...updated[index],
                status: "success",
                audioUrl: audio.audioUrl,
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

  // Setup socket connection and listeners
  useEffect(() => {
    let socketConnectAttempts = 0;
    const maxConnectAttempts = 3;
    
    function connectSocket() {
      // Only try to connect if we haven't exceeded max attempts
      if (socketConnectAttempts < maxConnectAttempts) {
        socketConnectAttempts++;
        console.log(`Socket connection attempt ${socketConnectAttempts}/${maxConnectAttempts}`);
        
        // Connect to socket
        socket.connect();
      } else {
        // We've exceeded max attempts, set up a polling fallback
        console.log('Max socket connection attempts reached, falling back to polling');
        setSocketConnected(false);
        // Start polling right away
        refreshExistingAudio();
      }
    }
    
    // Initial connection attempt
    connectSocket();
    
    // Handle successful connection
    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      socketConnectAttempts = 0; // Reset counter on successful connection
    });
    
    // Handle connection error
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      
      // Try to reconnect manually (socket.io has its own reconnect, but we're adding extra logic)
      if (socketConnectAttempts < maxConnectAttempts) {
        setTimeout(connectSocket, 2000); // Wait 2 seconds before retrying
      }
      
      // Show user-friendly error
      toast.error('Connection issue detected - using fallback mode', {
        id: 'socket-error',
        duration: 3000
      });
    });

    // Listen for chapter progress updates
    socket.on(`chapter-progress-${id}`, (data) => {
      console.log('Chapter progress update:', data);
      
      if (data.chapterIndex !== undefined) {
        if (data.progress !== undefined) {
          // Update progress for this chapter
          setChapterProgress(prev => ({
            ...prev,
            [data.chapterIndex]: data.progress
          }));
        }
        
        if (data.success === true) {
          // Chapter completed successfully
          setGenerationStatus(prev => {
            const updated = [...prev];
            if (updated[data.chapterIndex]) {
              updated[data.chapterIndex] = {
                ...updated[data.chapterIndex],
                status: "success",
                audioUrl: data.audioPath
              };
            }
            return updated;
          });
          
          // Update audio array
          if (data.audioPath) {
            setAudio(prev => {
              const newAudio = Array.isArray(prev) ? [...prev] : [];
              newAudio[data.chapterIndex] = data.audioPath as string;
              return newAudio;
            });
          }
          
          // Clear progress
          setChapterProgress(prev => {
            const updated = {...prev};
            delete updated[data.chapterIndex];
            return updated;
          });
          
          toast.success(`Chapter ${data.chapterIndex + 1} audio generated successfully`);
        }
        
        if (data.success === false) {
          // Chapter generation failed
          setGenerationStatus(prev => {
            const updated = [...prev];
            if (updated[data.chapterIndex]) {
              updated[data.chapterIndex] = {
                ...updated[data.chapterIndex],
                status: "error",
                error: data.error || "Failed to generate audio"
              };
            }
            return updated;
          });
          
          // Clear progress
          setChapterProgress(prev => {
            const updated = {...prev};
            delete updated[data.chapterIndex];
            return updated;
          });
          
          toast.error(`Failed to generate chapter ${data.chapterIndex + 1} audio`);
        }
      }
    });
    
    // Fallback mechanism - poll the server periodically to check progress
    // This is especially important if sockets aren't working
    const checkProgressInterval = setInterval(() => {
      if (currentGeneratingIndex !== null && generationStatus[currentGeneratingIndex]?.status === "loading") {
        // If socket isn't connected or we haven't received updates for a while, poll for updates
        if (!socketConnected) {
          refreshExistingAudio();
        }
      }
    }, 8000); // Check every 8 seconds
    
    // Cleanup on unmount
    return () => {
      socket.off(`chapter-progress-${id}`);
      socket.off('connect');
      socket.off('connect_error');
      socket.disconnect();
      clearInterval(checkProgressInterval);
    };
  }, [id, currentGeneratingIndex]);

  // Modified generateChapterAudio function to work with the socket updates
  const generateChapterAudio = async (chapterIndex: number) => {
    // Update status to loading
    setGenerationStatus((prev) => {
      const updated = [...prev];
      updated[chapterIndex] = {
        ...updated[chapterIndex],
        status: "loading",
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
          id: id,
          timeout: 180000
        },
      );

      if (response.success) {
        // The worker will update the UI via socket.io
        return true;
      }

      throw new Error(response.message || "Failed to generate audio");
    } catch (err: any) {
      console.error(`Error generating audio for chapter ${chapterIndex}:`, err);
      // Update status with error
      setGenerationStatus((prev) => {
        const updated = [...prev];
        updated[chapterIndex] = {
          ...updated[chapterIndex],
          status: "error",
          error: err.message || "Failed to generate audio"
        };
        return updated;
      });
      return false;
    }
  };

  // New function to generate all chapters sequentially in batches
  const generateAllChapters = async () => {
    // Make sure we're not already generating
    setIsGenerating(true);

    // Identify chapters that need generation (those in idle or error state)
    const chaptersToGenerate = generationStatus
      .map((status, index) => ({ index, status: status.status }))
      .filter((item) => item.status === "idle" || item.status === "error");

    // If no chapters need generation, show a message and return
    if (chaptersToGenerate.length === 0) {
      toast.success("All chapters already have audio!");
      setIsGenerating(false);
      return;
    }

    // Create a toast notification for overall progress
    const toastId = toast.loading(
      `Starting audio generation for ${chaptersToGenerate.length} chapters...`
    );

    // Track success/failure counts
    let successCount = 0;
    let failureCount = 0;
    let batchIndex = 0;
    
    // Break chapters into chunks/batches of 3
    const BATCH_SIZE = 2;
    const batches = [];
    for (let i = 0; i < chaptersToGenerate.length; i += BATCH_SIZE) {
      batches.push(chaptersToGenerate.slice(i, i + BATCH_SIZE));
    }
    
    // Process each batch sequentially
    for (let batch of batches) {
      batchIndex++;
      
      // Update toast with current batch information
      toast.loading(
        `Processing batch ${batchIndex}/${batches.length} (${batch.length} chapters)...`, 
        { id: toastId }
      );
      
      // Process chapters within this batch concurrently
      const batchResults = await Promise.all(
        batch.map(async (chapter) => {
          try {
            const chapterIndex = chapter.index;
            setCurrentGeneratingIndex(chapterIndex);
            
            // Use existing function to generate this chapter
            const success = await generateChapterAudio(chapterIndex);
            
            return { chapterIndex, success };
          } catch (err) {
            console.error(
              `Error in batch generation for chapter ${chapter.index}:`,
              err
            );
            return { chapterIndex: chapter.index, success: false };
          }
        })
      );
      
      // Count successes and failures in this batch
      for (const result of batchResults) {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
      
      // If there are more batches, wait 3 minutes before the next batch
      if (batchIndex < batches.length) {
        // Update toast with waiting message
        toast.loading(
          `Completed batch ${batchIndex}/${batches.length}. Waiting 3 minutes before next batch...`,
          { id: toastId }
        );
        
        // Start a countdown timer (updating every 15 seconds for UI)
        const WAIT_TIME = 2.5 * 60 * 1000; // 3 minutes in ms
        const startTime = Date.now();
        const endTime = startTime + WAIT_TIME;
        
        while (Date.now() < endTime) {
          const remainingSeconds = Math.ceil((endTime - Date.now()) / 1000);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          
          toast.loading(
            `Waiting for next batch... ${minutes}m ${seconds}s remaining`,
            { id: toastId }
          );
          
          // Wait 15 seconds before updating the countdown again
          await new Promise(resolve => setTimeout(resolve, Math.min(15000, remainingSeconds * 1000)));
          
          // If less than 15 seconds remain, just wait the exact amount
          if (remainingSeconds <= 15) {
            await new Promise(resolve => setTimeout(resolve, remainingSeconds * 1000));
            break;
          }
        }
      }
    }
    
    // Show final results
    if (failureCount === 0) {
      toast.success(
        `Successfully generated audio for all ${successCount} chapters!`,
        { id: toastId }
      );
    } else {
      toast.error(
        `Generated ${successCount} chapters, but ${failureCount} failed. You can retry those individually.`,
        { id: toastId, duration: 5000 }
      );
    }

    setCurrentGeneratingIndex(null);
    setIsGenerating(false);
  };

  const handleAudioEnded = () => {
    setCurrentlyPlaying(null);
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const allChaptersHaveAudio = () => {
    if(audio && audio?.length){
      return  audio.length === chapterDetails.length
    }
  };

  const combineAndDownloadAudio = async () => {
    if (!allChaptersHaveAudio()) {
      toast.error(
        "Not all chapters have audio generated. Please generate all chapter audios first."
      );
      return;
    }

    setCompleteAudioStatus({ status: "loading" });

    try {
      // Create an array of chapter audio information to send to the server
      const chapterAudios = generationStatus.map((status) => ({
        chapterId: status.chapterId,
        title: status.title,
        audioUrl: status.audioUrl,
      }));

      // Get content title for the filename
      let contentTitle = contentType === "book" ? "Book" : "Course";
      
      // Call API to combine audio files
      const response = await apiService.post(
        `/audio/combine/${contentType}/${id}`,
        { chapters: chapterAudios }
        // { timeout: 300000 } // 5 minute timeout for potentially large files
      );

      if (response.success && response.completeAudioBook) {
        const fullAudioUrl = response.completeAudioBook;

        handleDownloadComplete(fullAudioUrl,'CompleteAudio')
        setCompleteAudioStatus({ status: "success" });
        // Download the file
       
        toast.success("Complete audio created successfully!");
      } else {
        throw new Error(response.message || "Failed to combine audio files");
      }
    } catch (err: any) {
      console.error("Error combining audio files:", err);
      setCompleteAudioStatus({
        status: "error",
        error: err.message || "Failed to create complete audio",
      });
      toast.error(
        `Failed to create complete audio: ${err.message || "Unknown error"}`
      );
    }
  };

  const handleDownloadComplete = (audioUrl: string, title: string) => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Calculate overall progress
  const generatedCount = generationStatus.filter(
    (s) => s.status === "success"
  ).length;
  const errorCount = generationStatus.filter(
    (s) => s.status === "error"
  ).length;
  const totalProgress = chapterDetails.length
    ? Math.round((generatedCount / chapterDetails.length) * 100)
    : 0;
  const chaptersNeedingGeneration = generationStatus.filter(
    (s) => s.status === "idle" || s.status === "error"
  ).length;
  const isCompleteAudioAvailable = allChaptersHaveAudio();

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="relative">
          <Music className="w-14 h-14 text-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-6 text-xl font-medium text-gray-700">
          Preparing Audio Studio
        </h3>
        <p className="mt-3 text-sm text-gray-500">
          Loading your content and existing audio files...
        </p>
        <div className="mt-8 w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary/70 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-3">
          Something went wrong
        </h3>
        <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-6 max-w-lg text-center">
          {error}
        </div>
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
    <div className="container mx-auto px-3 sm:px-6 max-w-5xl pb-16">
      {/* Header section - improved mobile layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-3 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Editor
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Create Audio {contentType === "book" ? "Book" : "Course"}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Create professional audio narration for your {contentType}
          </p>
        </div>

        {/* Controls section - stacked on mobile, side by side on desktop */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {/* Voice selection dropdown */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="voice-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Voice Style
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="block w-full rounded-md border border-gray-200 shadow-sm py-2 px-3 text-sm bg-white focus:ring-1 focus:ring-primary/30 focus:border-primary"
              disabled={isGenerating}
            >
              {voiceOptions.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Control buttons - full width on mobile */}
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={refreshExistingAudio}
              disabled={fetchingExisting || isGenerating}
              className="flex-1 sm:flex-initial h-10 text-xs sm:text-sm font-medium border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${
                  fetchingExisting ? "animate-spin" : ""
                }`}
              />
              <span>{fetchingExisting ? "Refreshing..." : "Refresh"}</span>
            </Button>

            <Button
              onClick={generateAllChapters}
              disabled={false}
              className="flex-1 sm:flex-initial h-10 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium"
            >
              <>
                <Music className="w-4 h-4 mr-1.5" />
                <span>
                  Generate All{" "}
                  {chaptersNeedingGeneration > 0
                    ? `(${chaptersNeedingGeneration})`
                    : ""}
                </span>
              </>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress section - better paddings for mobile */}
      {
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
          <span className="text-gray-600 text-sm font-medium">Overall Progress</span>
          <div className="flex gap-2 items-center text-sm">
            <span className="text-primary font-semibold">{(audio ? audio.length : 0) || (oldAudio ? oldAudio.length : 0) || generatedCount}</span>
            <span className="text-gray-400">/</span>
            <span>{chapterDetails.length} chapters</span>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs ml-1 font-medium">
              {((audio ? audio.length : 0) || (oldAudio ? oldAudio.length : 0) ) ? 100 : totalProgress }%
            </span>
          </div>
        </div>
        {
          !isCompleteAudioAvailable && 
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
        }

        {errorCount > 0 && (
          <p className="flex items-center text-xs sm:text-sm text-red-500 mt-2">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            {errorCount} chapter{errorCount > 1 ? "s" : ""} failed to generate
          </p>
        )}

        {/* Complete Audio Download Button - Mobile responsive */}
       
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center sm:justify-end">
            <Button
              onClick={combineAndDownloadAudio}
              disabled={completeAudioStatus.status === "loading"}
              className={`w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all duration-300 ${
                completeAudioStatus.status === "loading" ? "opacity-75" : ""
              }`}
            >
              {completeAudioStatus.status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Audio...</span>
                </>
              ) : (
                <>
                  <FileAudio className="w-4 h-4" />
                  <span>Download Complete Audio</span>
                </>
              )}
            </Button>
          </div>
       
      </div>
      }

      {/* Chapters list - Better mobile layout */}
      <div className="space-y-5">
        {chapterDetails && chapterDetails.map((chapter, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-300 ${
              generationStatus[index]?.status === "error"
                ? "bg-red-50 border border-red-100"
                : generationStatus[index]?.status === "success"
                ? "bg-white border border-gray-100"
                : generationStatus[index]?.status === "loading"
                ? "bg-blue-50 border border-blue-100"
                : "bg-white border border-gray-100"
            } ${
              currentGeneratingIndex === index ? "ring-2 ring-primary/30" : ""
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <div className="flex items-center">
                  {generationStatus[index]?.status === "success" && (
                    <span className="flex h-5 w-5 mr-2 rounded-full bg-green-100 items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </span>
                  )}
                  <h2 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-1">
                    Chapter {index + 1}: {chapter.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                  {chapter.content.length > 120
                    ? `${chapter.content.substring(0, 120)}...`
                    : chapter.content}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 mt-1">
                {/* Show different UI based on generation status */}
                {audio && !audio.length &&  (
                  <Button
                    size="sm"
                    onClick={() => generateChapterAudio(index)}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 h-8 w-full sm:w-auto"
                  >
                    <Music className="w-3.5 h-3.5 mr-1.5" />
                    Generate Audio
                  </Button>
                )}

                {generationStatus[index]?.status === "loading" && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md w-full sm:w-auto justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm">
                      {chapterProgress[index] !== undefined 
                        ? `${Math.round(chapterProgress[index])}%` 
                        : "Generating..."}
                    </span>
                  </div>
                )}

                {generationStatus[index]?.status === "error" && (
                  <div className="flex flex-col sm:flex-row items-center justify-end w-full gap-2">
                    <span className="text-red-500 text-xs sm:text-sm text-center sm:text-right sm:mr-2 w-full sm:w-auto sm:max-w-[200px] line-clamp-1">
                      {generationStatus[index]?.error || "Error generating audio"}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => generateChapterAudio(index)}
                      disabled={isGenerating}
                      className="border-red-400 text-red-500 hover:bg-red-50 text-xs w-full sm:w-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}

                {generationStatus[index]?.status === "success" && (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDownload(
                          generationStatus[index].audioUrl!,
                          chapter.title
                        )
                      }
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 h-8 sm:w-8 p-0 sm:p-0 w-full sm:justify-center"
                    >
                      <Download className="h-3.5 w-3.5 sm:mr-0 mr-1.5" />
                      <span className="sm:hidden">Download</span>
                    </Button>

                    {/* Hidden audio element */}
                    <audio
                      ref={(el) => (audioRefs.current[index] = el)}
                      src={generationStatus[index].audioUrl}
                      onEnded={handleAudioEnded}
                      className="hidden"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar for generation in progress */}
            {generationStatus[index]?.status === "loading" && chapterProgress[index] !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${chapterProgress[index]}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1 text-right">
                  {Math.round(chapterProgress[index])}% Complete
                </p>
              </div>
            )}

            {/* Audio player - full width on both mobile and desktop */}
            {
              (audio && audio.length) ?
              (
                <div className="mt-3 bg-gray-50 rounded-lg p-2 sm:p-3">
                  <audio
                    controls
                    className="w-full h-9 sm:h-10"
                    src={audio[index]}
                    controlsList="nodownload"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) :
              
              (oldAudio && oldAudio.length) ?  (
                
                <div className="mt-3 bg-gray-50 rounded-lg p-2 sm:p-3">
                  <audio
                    controls
                    className="w-full h-9 sm:h-10"
                    src={oldAudio[index]}
                    controlsList="nodownload"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ): null
            }
          </div>
        ))}
      </div>

      {/* Empty state */}
      {chapterDetails.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
            No chapters found
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto px-4">
            This {contentType} doesn't have any chapters available to convert to
            audio.
          </p>
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
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
