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

// Get the API base URL based on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://minilessonsacademy.onrender.com";

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
  const [batchGenerating, setBatchGenerating] = useState(false);

  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<
    number | null
  >(null);
  const [completeAudioStatus, setCompleteAudioStatus] =
    useState<CompleteAudioStatus>({ status: "idle" });
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const navigate = useNavigate();

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

  console.log(chapterDetails, "chapter details");

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

            console.log(parsedChapters, "see parsed");

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
                return {
                  title: chapter.title,
                  content: "",
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
              blobUrl: contentResponse?.data?.blob_url,
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
  const chapterTitles = chapterDetails.map((chapter) => chapter.title);
    const getAudio = async () => {
      const audios = await apiService.post(
        `course-creator/audio/${courseId}`, {
          chapters:chapterTitles
        }
      );
       setGenerationStatus((prev) => {
        const updated = [...prev];
        audios.data.chapters.map((item:any, index:any)=> {
          updated[index] = {
            ...updated[index],
            status: "success",
            audioUrl: item.audioUrl,
          };
        })
        return updated;
      }
      );
      setExistingAudios((prev) => {
        const updated = [...prev];
        audios.data.chapters.map((item:any, index:any)=> {
          updated[index] = {
            ...updated[index],
            audioUrl: item.audioUrl,
            voice: item.voice,
            createdAt: item.createdAt,
          };
        })
        return updated;
      }
      );
    };


    getAudio();
    
  }, [chapterDetails]);

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

  // Generate audio for a single chapter
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
        },
        { timeout: 120000 } // 2 minute timeout to accommodate longer processing
      );

      if (response.success) {
        // Handle different response formats
        const audioPath = response.data?.audioPath || response.data?.audioUrl;

        if (audioPath) {
          const fullAudioUrl = getFullAudioUrl(audioPath);

          // Update status with successful result
          setGenerationStatus((prev) => {
            const updated = [...prev];
            updated[chapterIndex] = {
              ...updated[chapterIndex],
              status: "success",
              audioUrl: fullAudioUrl,
            };
            return updated;
          });

          // Update existing audios list
          setExistingAudios((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (a) => a.chapterIndex === chapterIndex
            );

            if (index >= 0) {
              // Update existing entry
              updated[index].audioUrl = fullAudioUrl;
            } else {
              // Add new entry
              updated.push({
                chapterIndex,
                audioUrl: fullAudioUrl,
                voice: selectedVoice,
                createdAt: new Date().toISOString(),
              });
            }

            return updated;
          });

          return true;
        }
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
          error: err.message || "Failed to generate audio",
        };
        return updated;
      });

      if (!batchGenerating) {
        toast.error(
          `Failed to generate audio: ${err.message || "Unknown error"}`
        );
      }
      return false;
    }
  };

  // New function to generate all chapters sequentially
  const generateAllChapters = async () => {
    // Make sure we're not already generating
    if (batchGenerating) return;

    setBatchGenerating(true);
    setIsGenerating(true);

    // Identify chapters that need generation (those in idle or error state)
    const chaptersToGenerate = generationStatus
      .map((status, index) => ({ index, status: status.status }))
      .filter((item) => item.status === "idle" || item.status === "error");

    // If no chapters need generation, show a message and return
    if (chaptersToGenerate.length === 0) {
      toast.success("All chapters already have audio!");
      setBatchGenerating(false);
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

    // Process chapters sequentially
    for (let i = 0; i < chaptersToGenerate.length; i++) {
      const chapterIndex = chaptersToGenerate[i].index;
      setCurrentGeneratingIndex(chapterIndex);

      // Update progress toast
      toast.loading(
        `Generating chapter ${i + 1} of ${chaptersToGenerate.length}: "${
          chapterDetails[chapterIndex].title
        }"`,
        { id: toastId }
      );

      try {
        // Use existing function to generate this chapter
        const success = await generateChapterAudio(chapterIndex);

        if (success) {
          successCount++;
        } else {
          failureCount++;
        }

        // Add a small delay between chapters
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(
          `Error in batch generation for chapter ${chapterIndex}:`,
          err
        );
        failureCount++;
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
    setBatchGenerating(false);
    setIsGenerating(false);
  };

  // const handlePlay = (chapterIndex: number) => {
  //   // Stop any currently playing audio
  //   if (currentlyPlaying !== null && audioRefs.current[currentlyPlaying]) {
  //     audioRefs.current[currentlyPlaying]?.pause();
  //   }

  //   // Play the selected chapter
  //   const audioElement = audioRefs.current[chapterIndex];
  //   if (audioElement) {
  //     // Set new event listeners for this specific playback
  //     const playPromise = audioElement.play();

  //     if (playPromise !== undefined) {
  //       playPromise
  //         .then(() => {
  //           setCurrentlyPlaying(chapterIndex);
  //         })
  //         .catch(err => {
  //           console.error("Error playing audio:", err);
  //           setCurrentlyPlaying(null);
  //         });
  //     } else {
  //       setCurrentlyPlaying(chapterIndex);
  //     }
  //   }
  // };

  // const handlePause = (chapterIndex: number) => {
  //   const audioElement = audioRefs.current[chapterIndex];
  //   if (audioElement) {
  //     audioElement.pause();
  //     setCurrentlyPlaying(null);
  //   }
  // };

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
    return (
      generationStatus.length > 0 &&
      generationStatus.every(
        (status) => status.status === "success" && status.audioUrl
      )
    );
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

      if (response.success && response.data?.audioPath) {
        const fullAudioUrl = getFullAudioUrl(response.data.audioPath);

        setCompleteAudioStatus({
          status: "success",
          url: fullAudioUrl,
        });

        // Download the file
        handleDownloadComplete(fullAudioUrl, `Complete-${contentTitle}-${id}`);

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
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Editor
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Create Audio {contentType === "book" ? "Book" : "Course"}
          </h1>
          <p className="text-gray-600 mt-1.5">
            Create professional audio narration for your {contentType}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Voice selection dropdown */}
          <div>
            <label
              htmlFor="voice-select"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Voice Style
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="block w-full rounded-md border border-gray-200 shadow-sm py-2.5 px-3 text-sm bg-white focus:ring-1 focus:ring-primary/30 focus:border-primary"
              disabled={isGenerating || batchGenerating}
            >
              {voiceOptions.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={refreshExistingAudio}
              disabled={fetchingExisting || isGenerating}
              className="h-10 text-sm font-medium border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  fetchingExisting ? "animate-spin" : ""
                }`}
              />
              <span>{fetchingExisting ? "Refreshing..." : "Refresh"}</span>
            </Button>

            <Button
              onClick={generateAllChapters}
              disabled={isGenerating || chaptersNeedingGeneration === 0}
              className="h-10 bg-primary hover:bg-primary/90 text-white text-sm font-medium"
            >
              {batchGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  <span>
                    Generate All{" "}
                    {chaptersNeedingGeneration > 0
                      ? `(${chaptersNeedingGeneration})`
                      : ""}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <div className="flex gap-2 items-center">
            <span className="text-primary font-semibold">{generatedCount}</span>
            <span className="text-gray-400">/</span>
            <span>{chapterDetails.length} chapters</span>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs ml-1 font-medium">
              {totalProgress}%
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>

        {errorCount > 0 && (
          <p className="flex items-center text-sm text-red-500 mt-2">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {errorCount} chapter{errorCount > 1 ? "s" : ""} failed to generate
          </p>
        )}

        {/* Complete Audio Download Button - New addition */}
        {isCompleteAudioAvailable && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              onClick={combineAndDownloadAudio}
              disabled={completeAudioStatus.status === "loading"}
              className={`bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                completeAudioStatus.status === "loading" ? "opacity-75" : ""
              }`}
            >
              {completeAudioStatus.status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Complete Audio...</span>
                </>
              ) : (
                <>
                  <FileAudio className="w-4 h-4" />
                  <span>Download Complete Audio</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Chapters list */}
      <div className="space-y-5">
        {chapterDetails.map((chapter, index) => (
          <div
            key={index}
            className={`rounded-xl p-5 shadow-sm transition-all duration-300 ${
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center">
                  {generationStatus[index]?.status === "success" && (
                    <span className="flex h-6 w-6 mr-2 rounded-full bg-green-100 items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </span>
                  )}
                  <h2 className="font-semibold text-lg text-gray-800">
                    {chapter.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {chapter.content.length > 150
                    ? `${chapter.content.substring(0, 150)}...`
                    : chapter.content}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Show different UI based on generation status */}
                {(!generationStatus[index] ||
                  generationStatus[index]?.status === "idle") && (
                  <Button
                    size="sm"
                    onClick={() => generateChapterAudio(index)}
                    disabled={isGenerating || batchGenerating}
                    className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 h-8"
                  >
                    <Music className="w-3.5 h-3.5 mr-1.5" />
                    Generate
                  </Button>
                )}

                {generationStatus[index]?.status === "loading" && (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Generating...</span>
                  </div>
                )}

                {generationStatus[index]?.status === "error" && (
                  <div className="flex items-center">
                    <span className="text-red-500 text-sm mr-2 max-w-[200px] line-clamp-1">
                      {generationStatus[index]?.error || "Error"}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => generateChapterAudio(index)}
                      disabled={isGenerating || batchGenerating}
                      className="border-red-400 text-red-500 hover:bg-red-50 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}

                {generationStatus[index]?.status === "success" && (
                  <div className="flex items-center gap-2">
                    {/* {currentlyPlaying === index ? (
                      <Button
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePause(index)}
                        className="border-primary text-primary hover:bg-primary/5 h-8 w-8 p-0"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlay(index)}
                        className="border-primary text-primary hover:bg-primary/5 h-8 w-8 p-0"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                     */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDownload(
                          generationStatus[index].audioUrl!,
                          chapter.title
                        )
                      }
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
                    >
                      <Download className="h-3.5 w-3.5" />
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

            {/* Audio player when generated successfully */}
            {generationStatus[index]?.status === "success" &&
              generationStatus[index]?.audioUrl && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <audio
                    controls
                    className="w-full"
                    src={generationStatus[index].audioUrl}
                    controlsList="nodownload"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {chapterDetails.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No chapters found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
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
