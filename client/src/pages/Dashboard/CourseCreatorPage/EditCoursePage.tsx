import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import {
  Book,
  ImageIcon,
  PackagePlus,
  ShieldCloseIcon,
  Loader2,
  Save,
  ExternalLink,
  Import,
} from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";
import { GenerateQuiz } from "../../../components/GenerateQuiz";
import { useNavigate, useLocation } from "react-router";
import { Music } from "lucide-react";
import ChapterQuizDisplay from "../../../components/ChapterQuizDisplay";

import {
  processChapterSelection,
  handleContentUpdate,
  updateEditorImage,
  generateCoverContent,
  isCoverChapter,
  extractChapterTitle,
  formatQuizContent,
} from "../../../utilities/shared/editorUtils";
import {
  determineQuizType,
  formatQuizHTML,
} from "../../../utilities/shared/quizUtils";
import { QuizDisplay } from "../../../components/QuizDisplay";
import BackButton from "../../../components/ui/BackButton";

interface QuillEditor {
  getContents: () => Delta;
  setContents: (delta: Delta) => void;
  root: HTMLElement;
}

interface Delta {
  ops: Operation[];
}

interface Operation {
  insert?: string | { image: string } | any;
  attributes?: Record<string, any>;
}

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [convertingBlob, setConvertingBlob] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [AIImage, setAiIMage] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(-1);
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>("");
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(
    null
  );
  const [isGalleryVisible, setIsGalleryVisible] = useState(true);

  const quillRef = useRef<ReactQuill>(null);
  const [showEditConfirmation, setShowEditConfirmation] =
    useState<boolean>(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [chapterToDelete, setChapterToDelete] = useState<number>(-1);
  const [OpenQuizModal, setOpenQuizModal] = useState<boolean>(false);
  const [currentQuizContent, setCurrentQuizContent] = useState<{
    editorContent: string;
    sharedContent: string;
  } | null>(null);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] =
    useState<number>(-1);
  const [showLeaveConfirmation, setShowLeaveConfirmation] =
    useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [importingQuiz, setImportingQuiz] = useState<boolean>(false);
  const [quizUrl, setQuizUrl] = useState<string>("");
  const [isRefreshingCourse, setIsRefreshingCourse] = useState(false);
  const [hasQuizBeenImported, setHasQuizBeenImported] = useState(false);
  const [chapterQuiz, setChapterQuiz] = useState("");
  const [quizMessage, setQuizMessage] = useState("");

  const toggleQuizModal = () => setOpenQuizModal(!OpenQuizModal);

  const handleImageClick = (imageUrl: string) => {
    setPendingImageUrl(imageUrl);
    setShowEditConfirmation(true);
    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  const handleConfirmEdit = () => {
    if (pendingImageUrl) {
      setCurrentEditingImage(pendingImageUrl);
      setOpenEditor(true);
    }
    setShowEditConfirmation(false);
  };

  const handleCancelEdit = () => {
    setPendingImageUrl(null);
    setShowEditConfirmation(false);
  };

  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response: any = await apiService.get(
          `/course-creator/getCourseById/${id}/course`,
          {}
        );
        setCourseData(response.data);

        if (response.data?.content) {
          try {
            const parsed = JSON.parse(response.data.content);
            if (typeof parsed === "string") {
              const again = JSON.parse(parsed);
              setChapters(again);
            } else {
              setChapters(parsed);
            }
          } catch (e) {
            console.error("Error parsing course content", e);
            setChapters([]);
          }
        } else if (response.data?.blob_location) {
          // If content is null but blob_location exists, convert blob to chapters
          setConvertingBlob(true);
          try {
            const blobResponse = await apiService.post(
              "/course-creator/convert-blob-to-chapters",
              {
                blobUrl: response.data.blob_location,
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

              if (updateResponse.success) {
                setChapters(blobResponse.data.chapters);
              } else {
                throw new Error(
                  "Failed to update course with converted content"
                );
              }
            } else {
              throw new Error(
                blobResponse.message || "Failed to convert blob to chapters"
              );
            }
          } catch (err: any) {
            setError(err.message || "Error converting blob to chapters");
          } finally {
            setConvertingBlob(false);
          }
        }

        // Check for quiz_location and convert external quiz if it exists
        if (response.data?.quiz_location && !hasQuizBeenImported) {
          const quizFinalUrl = response?.data?.quiz_location.includes(
            "minilessonsacademy"
          )
            ? response?.data?.quiz_location
            : `https://minilessonsacademy.com/${response?.data?.quiz_location}`;
          try {
            const quizResponse = await apiService.post(
              "/course-creator/convert-external-quiz",
              {
                // quizUrl: `https://minilessonsacademy.com${response.data.quiz_location}`,
                quizUrl: quizFinalUrl,
              }
            );

            if (quizResponse.success) {
              setHasQuizBeenImported(true);
              setIsRefreshingCourse(true);
              // Fetch course again to get updated content with quizzes
              const updatedResponse = await apiService.get(
                `/course-creator/getCourseById/${id}/course`,
                {}
              );
              if (updatedResponse.data?.content) {
                try {
                  const parsed = JSON.parse(updatedResponse.data.content);
                  if (typeof parsed === "string") {
                    const again = JSON.parse(parsed);
                    setChapters(again);
                  } else {
                    setChapters(parsed);
                  }
                } catch (e) {
                  console.error("Error parsing updated course content", e);
                }
              }
            }
          } catch (error) {
            console.error("Error converting external quiz:", error);
            toast.error("Error converting external quiz");
          } finally {
            setIsRefreshingCourse(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error fetching course data");
      } finally {
        setLoading(false);
      }
    };

    if (id && !isRefreshingCourse) {
      fetchCourse();
    }
  }, [id, hasQuizBeenImported, isRefreshingCourse]);

  const handleAIImageSelect = (imageUrl: string) => {
    setAiIMage(imageUrl);
    setShowImageGenerator(false);
  };

  const handleContentChange = (newContent: string) => {
    if (newContent !== selectedChapter) {
      setHasUnsavedChanges(true);
    }
    setSelectedChapter(newContent);
  };

  const handleChapterSelect = (chapterContent: any, index: number) => {
    if (chapterContent.title && chapterContent.content) {
      console.log(chapterContent.quiz, "quiz coming here ====>");
      setSelectedChapterTitle(chapterContent.title);
      setSelectedChapter(chapterContent.content);
      if (chapterContent.quiz) {
        setChapterQuiz(chapterContent.quiz);
      } else {
        setChapterQuiz;
      }

      if (
        chapterContent?.quiz &&
        chapterContent?.quiz?.editorContent &&
        chapterContent.quiz.sharedContent
      ) {
        setCurrentQuizContent(chapterContent.quiz);
      }
      setSelectedChapterIndex(index);
      setQuizMessage(
        "This quiz is generated using legacy application, for new quizes you have to delete the old ones"
      );
    } else {
      const {
        isCover,
        content,
        title,
        quizContent,
        index: selectedIndex,
      } = processChapterSelection(chapterContent, index);

      console.log(quizContent);
      setSelectedChapterTitle(title);
      setSelectedChapter(content);
      setSelectedChapterIndex(selectedIndex);
      setCurrentQuizContent(quizContent);
    }
    // setCurrentQuizContent(quizContent);
  };

  const handleSave = async (deleteQuiz: any) => {
    try {
      console.log("before");
      if (selectedChapterIndex === -1) return;
      const updatedChapters = [...chapters];
      const updatedContent = handleContentUpdate(
        selectedChapter,
        selectedChapterTitle,
        Boolean(currentQuizContent),
        chapters[selectedChapterIndex],
        currentQuizContent
      ) as any;

      console.log("before quiz");

      if (deleteQuiz) {
        updatedContent.quiz = null;
        setCurrentQuizContent(null);
        setChapterQuiz("");
      }

      console.log("after quiz");

      updatedChapters[selectedChapterIndex] = updatedContent;

      console.log(updatedContent, "see updated content");

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: Array.isArray(updatedChapters)
            ? JSON.stringify(updatedChapters)
            : updatedChapters,
        }
      );

      if (response.success) {
        setChapters(updatedChapters);
        setHasUnsavedChanges(false); // Reset flag after successful save
        // toast.success('Changes saved successfully');
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Error saving content");
    }
  };

  const handleEditedImageSave = (editedImageUrl: string): void => {
    if (!quillRef.current || !currentEditingImage) return;

    const editor = quillRef.current.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    const delta = editor.getContents();

    const updatedDelta = updateEditorImage(
      delta,
      currentEditingImage,
      editedImageUrl
    );

    editor.setContents(updatedDelta as any);
    if (range) editor.setSelection(range.index, range.length);

    handleContentChange(editor.root.innerHTML);
    handleSave(false);

    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  const handleAddCoverImage = async (imageUrl: string) => {
    try {
      const coverContent = generateCoverContent(imageUrl);
      console.log('first',chapters)
      // Remove any existing cover chapter

      let updatedChapters = chapters.filter(
        (chapter:any) => typeof(chapter)==='string' ? !isCoverChapter(chapter) : !isCoverChapter(chapter.content) 
      );
      // Insert the new cover at the beginning
      updatedChapters.unshift(coverContent);

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters),
        }
      );
      if (response.success) {
        setChapters(updatedChapters);
        setSelectedChapterTitle("Book Cover");
        setSelectedChapter("");
        setSelectedChapterIndex(0);
        toast.success("Book cover added successfully");
      } else {
        toast.error("Failed to save book cover");
      }
    } catch (error) {
      toast.error("Error saving book cover");
    }
  };

  const handleRemoveCoverImage = async () => {
    try {
      const coverIndex = chapters.findIndex((chapter) =>
        isCoverChapter(chapter)
      );

      if (coverIndex < 0) {
        toast.error("No cover image found");
        return;
      }

      const updatedChapters = [...chapters];
      updatedChapters.splice(coverIndex, 1);

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters),
        }
      );

      if (response.success) {
        setChapters(updatedChapters);

        if (updatedChapters.length > 0) {
          handleChapterSelect(updatedChapters[0], 0);
        } else {
          setSelectedChapter("");
          setSelectedChapterTitle("");
          setSelectedChapterIndex(-1);
        }

        toast.success("Course cover removed successfully");
      } else {
        toast.error("Failed to remove course cover");
      }
    } catch (error) {
      console.error("Error removing course cover:", error);
      toast.error("Error removing course cover");
    }
  };

  const handleDeleteChapter = (index: number) => {
    setChapterToDelete(index);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (chapterToDelete === -1) return;

    try {
      const updatedChapters = [...chapters];
      updatedChapters.splice(chapterToDelete, 1);

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters),
        }
      );

      if (response.success) {
        setChapters(updatedChapters);

        if (chapterToDelete === selectedChapterIndex) {
          if (updatedChapters.length > 0) {
            handleChapterSelect(updatedChapters[0], 0);
          } else {
            setSelectedChapter("");
            setSelectedChapterTitle("");
            setSelectedChapterIndex(-1);
          }
        } else if (chapterToDelete < selectedChapterIndex) {
          setSelectedChapterIndex(selectedChapterIndex - 1);
        }

        toast.success("Chapter deleted successfully");
      } else {
        toast.error("Failed to delete chapter");
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Error deleting chapter");
    } finally {
      setShowDeleteConfirmation(false);
      setChapterToDelete(-1);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setChapterToDelete(-1);
  };

  const handleSaveQuiz = (editorQuizHTML: string, sharedQuizHTML: string) => {
    setCurrentQuizContent({
      editorContent: editorQuizHTML,
      sharedContent: sharedQuizHTML,
    });

    const updatedChapters = [...chapters];
    const finalChapterContent = formatQuizContent(
      editorQuizHTML,
      sharedQuizHTML,
      selectedChapterTitle,
      selectedChapter
    );

    updatedChapters[selectedChapterIndex] = finalChapterContent;

    apiService
      .post(`/course-creator/updateCourse/${id}/course`, {
        content: JSON.stringify(updatedChapters),
      })
      .then((response) => {
        if (response.success) {
          setChapters(updatedChapters);
          toast.success("Quiz added to chapter successfully!");
        } else {
          toast.error("Failed to save quiz to chapter");
        }
      })
      .catch((error) => {
        console.error("Error saving quiz:", error);
        toast.error("Error saving quiz");
      });

    setOpenQuizModal(false);
  };

  const handleRegenerateQuestion = async (questionIndex: number) => {
    if (!selectedChapter || !currentQuizContent) {
      toast.error("No quiz content available");
      return;
    }

    setRegeneratingQuestionIndex(questionIndex);

    try {
      // Store the original quiz content as backup
      const originalQuizContent = { ...currentQuizContent };

      // Create a parser and parse the current chapter HTML
      const parser = new DOMParser();

      // CRITICAL: We need to extract CLEAN chapter content with no quiz data at all
      // This will be what we show in the editor and what we use as base for saving
      const doc = parser.parseFromString(selectedChapter, "text/html");

      // Remove any quiz sections that might already be in the editor
      const quizSections = doc.querySelectorAll("h2");
      quizSections.forEach((section) => {
        if (section.textContent?.trim().toLowerCase() === "exercises") {
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

      // Get the clean chapter content without any quiz sections
      const cleanContent = doc.body.innerHTML;
      const textContent = doc.body.textContent || "";
      const quizType = determineQuizType(currentQuizContent.sharedContent);

      const response = await apiService.post(
        "/generate-quiz",
        {
          chapterContent: textContent,
          quizType,
          questionCount: 1,
          preserveStructure: true,
          questionIndex,
        },
        { timeout: 60000 }
      );

      if (response.success && response.data) {
        try {
          // Format the quiz HTML with the new question
          const formattedQuiz = await formatQuizHTML({
            ...response.data,
            existingQuiz: currentQuizContent,
            replaceQuestionIndex: questionIndex,
          });

          // IMPORTANT FIX: Ensure the editor content has the h2 heading
          let editorContent = formattedQuiz.editorQuizHTML;
          if (!editorContent.trim().startsWith("<h2>Exercises</h2>")) {
            editorContent = `<h2>Exercises</h2>${editorContent}`;
          }

          // Update the quiz content state to show in the separate display
          setCurrentQuizContent({
            editorContent: editorContent,
            sharedContent: formattedQuiz.sharedQuizHTML,
          });

          // IMPORTANT: Create the final chapter content with ONLY the clean content
          // in the visible editor part, and proper quiz content as metadata
          const updatedChapters = [...chapters];
          const finalChapterContent = formatQuizContent(
            editorContent, // Using our fixed editor content
            formattedQuiz.sharedQuizHTML, // This contains the interactive quiz
            selectedChapterTitle,
            cleanContent // This is the clean chapter content WITHOUT any quiz sections
          );

          updatedChapters[selectedChapterIndex] = finalChapterContent;

          const saveResponse = await apiService.post(
            `/course-creator/updateCourse/${id}/course`,
            {
              content: JSON.stringify(updatedChapters),
            }
          );

          if (saveResponse.success) {
            setChapters(updatedChapters);

            // CRITICAL: Update the editor to show only the clean content,
            // NOT the content with the quiz embedded
            setSelectedChapter(cleanContent);

            // toast.success('Question regenerated successfully');
          } else {
            // Revert to original quiz content on save failure
            setCurrentQuizContent(originalQuizContent);
            toast.error("Failed to save regenerated question");
          }
        } catch (error) {
          console.error("Error processing regenerated question:", error);
          setCurrentQuizContent(originalQuizContent);
          toast.error("Failed to process regenerated question");
        }
      } else {
        toast.error(response.message || "Failed to regenerate question");
      }
    } catch (error) {
      console.error("Error regenerating question:", error);
      toast.error("Error regenerating question");
    } finally {
      setRegeneratingQuestionIndex(-1);
    }
  };

  const handleDeleteQuiz = async () => {
    if (selectedChapterIndex === -1 || !currentQuizContent) {
      toast.error("No quiz available to delete");
      return;
    }

    setCurrentQuizContent(null);
    setChapterQuiz("");
    handleSave(true);
  };

  const handleCreateAudio = async () => {
    const response = await apiService.post(`/audio/generate/${id}/course`, {
      voice: "alloy", // optional, defaults to "echo"
    });

    if (response.success) {
      toast.success("Audio created successfully");
    } else {
      toast.error("Failed to create audio");
    }
  };

  useEffect(() => {
    // Confirmation handler for when user tries to navigate away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard browser confirmation dialog
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        setShowLeaveConfirmation(true);
        return ""; // This text is usually ignored by most browsers
      }
    };

    // Add listener for tab/window closing
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Hook into history changes
    const unblock = () => {
      // Show our custom dialog when navigating away
      if (hasUnsavedChanges) {
        setShowLeaveConfirmation(true);
        return false;
      }
      return true;
    };

    // Handle browser back button
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        // Prevent the default navigation
        e.preventDefault();
        // Show our custom dialog
        setShowLeaveConfirmation(true);
        // Push current state back to keep us on this page
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    // Push state to enable catching the back button
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleConfirmLeave = async () => {
    // Save content before leaving
    await handleSave(false);
    setShowLeaveConfirmation(false);
    // Allow navigation to continue
    navigate("/dashboard");
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
    // Stay on the page
  };

  const handleImportExternalQuiz = async () => {
    if (!quizUrl) {
      toast.error("Please enter a valid quiz URL");
      return;
    }

    setImportingQuiz(true);
    try {
      const response = await apiService.post(
        "/course-creator/convert-external-quiz",
        {
          quizUrl,
        }
      );

      if (response.success && response.data) {
        // Format the quiz HTML with the imported quiz data
        const formattedQuiz = await formatQuizHTML({
          quizTitle: response.data.quizTitle,
          quizType: response.data.quizType,
          questions: response.data.questions,
        });

        // Update the quiz content state
        setCurrentQuizContent({
          editorContent: formattedQuiz.editorQuizHTML,
          sharedContent: formattedQuiz.sharedQuizHTML,
        });

        // Update the chapter with the new quiz
        const updatedChapters = [...chapters];
        const finalChapterContent = formatQuizContent(
          formattedQuiz.editorQuizHTML,
          formattedQuiz.sharedQuizHTML,
          selectedChapterTitle,
          selectedChapter
        );

        updatedChapters[selectedChapterIndex] = finalChapterContent;

        const saveResponse = await apiService.post(
          `/course-creator/updateCourse/${id}/course`,
          {
            content: JSON.stringify(updatedChapters),
          }
        );

        if (saveResponse.success) {
          setChapters(updatedChapters);
          setQuizUrl("");
          toast.success("Quiz imported successfully");
        } else {
          toast.error("Failed to save imported quiz");
        }
      } else {
        toast.error(response.message || "Failed to import quiz");
      }
    } catch (error) {
      console.error("Error importing quiz:", error);
      toast.error("Error importing quiz");
    } finally {
      setImportingQuiz(false);
    }
  };

  const handleSaveContent = async () => {
    await handleSave(false);
  };

  if (loading || convertingBlob)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="relative">
          <Book className="w-12 h-12 text-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">
          {convertingBlob
            ? "Converting content to chapters..."
            : "Loading course content..."}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {convertingBlob
            ? "Please wait while we process your course content"
            : "Please wait while we prepare your course editor"}
        </p>
        <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>
      {/* Main container with responsive layout changes */}
      <div className="flex flex-col p-2 md:p-4 gap-4 lg:gap-6 max-w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <BackButton onBeforeNavigate={() => true} label="Back to Dashboard" />
          <div className="flex justify-between">
            <div className="flex flex-wrap items-center text-primary gap-2">
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={toggleQuizModal}
              >
                <PackagePlus className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Create Quiz</span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => navigate(`/create-audio/course/${id}`)}
              >
                <Music className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Create Audio</span>
              </Button>

              <GenerateCover
                onCoverImageGenerated={handleAddCoverImage}
                courseId={id}
                contentType={"course"}
              />

              <div className="text-primary">
                <Button
                  variant="soft"
                  size="sm"
                  ref={buttonRef}
                  onClick={() => setShowImageGenerator(!showImageGenerator)}
                  className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                  title={
                    showImageGenerator
                      ? "Hide AI Image Generator"
                      : "Generate AI Image"
                  }
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap">
                    Generate Image
                  </span>
                </Button>
              </div>

              {selectedChapterIndex !== -1 &&
                chapters[selectedChapterIndex] &&
                typeof chapters[selectedChapterIndex] === "string" &&
                (chapters[selectedChapterIndex].includes('data-cover="true"') ||
                  chapters[selectedChapterIndex].includes(
                    "book-cover-image"
                  )) && (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleRemoveCoverImage}
                    className="bg-red-100 hover:bg-red-200 transition flex items-center gap-1"
                    title="Remove cover image"
                  >
                    <ShieldCloseIcon className="w-4 h-4 text-red-600" />
                    <span className="text-xs whitespace-nowrap">
                      Remove Cover
                    </span>
                  </Button>
                )}
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => window.open(`/shared/course/${id}`, "_blank")}
                title="View live published version in new tab"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span className="text-xs whitespace-nowrap">share preview</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 ml-auto px-4 py-2.5"
                onClick={() => handleSave(false)}
                title="Save your content changes"
              >
                <Save className="w-4 h-4 text-white" />
                <span className="text-xs font-medium whitespace-nowrap">
                  Save Content
                </span>
              </Button>
            </div>
          </div>
        </div>
        {/* Toolbar area */}

        {/* Main editor area and sidebar container */}
        <div className="flex  gap-4">
          {/* Chapter gallery - now a responsive drawer */}
          <div className="h-[calc(100vh-150px)]">
            <ChapterGallery
              chapters={chapters}
              onSelectChapter={handleChapterSelect}
              onDeleteChapter={handleDeleteChapter}
              isVisible={isGalleryVisible}
              onToggleVisibility={toggleGallery}
            />
          </div>
          {/* Main editing area - responsive width based on gallery visibility */}
          <div
            className={`p-4 md:p-6 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out
          ${isGalleryVisible ? "w-full md:flex-1" : "w-full"}`}
          >
            <div className="w-full h-full overflow-hidden flex flex-col">
              {/* Rich text editor */}
              <div className="flex-grow overflow-auto">
                <RichTextEditor
                  ref={quillRef}
                  initialContent={selectedChapter}
                  imageUrl={AIImage}
                  id={Number(id)}
                  onContentChange={handleContentChange}
                  onSave={() => handleSave(false)}
                  onImageClick={handleImageClick}
                />
              </div>

              {/* Quiz display area */}
              {chapterQuiz && chapterQuiz.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ChapterQuizDisplay
                    quizContent={chapterQuiz}
                    quizMessage={quizMessage}
                  />
                </div>
              )}

              {currentQuizContent && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Chapter Quiz
                  </h3>
                  <QuizDisplay
                    quizContent={currentQuizContent}
                    onRegenerateQuestion={handleRegenerateQuestion}
                    regeneratingQuestionIndex={regeneratingQuestionIndex}
                    onDeleteQuiz={handleDeleteQuiz}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals and dialog boxes - unchanged */}
      <Modal
        isOpen={openEditor}
        onClose={() => setOpenEditor(false)}
        title="Image Editor"
      >
        <ImageEditor
          initialImageUrl={currentEditingImage || ""}
          onSave={handleEditedImageSave}
        />
      </Modal>

      <Modal
        isOpen={showImageGenerator}
        onClose={() => setShowImageGenerator(false)}
        title="Image Generator"
      >
        <ImageGenerator
          onImageSelect={handleAIImageSelect}
          isEditorContext={true}
          NotCover={true}
          contentType={"course"}
          courseId={id}
        />
      </Modal>

      <Modal
        isOpen={OpenQuizModal}
        onClose={toggleQuizModal}
        title="Create Quiz"
      >
        <GenerateQuiz
          selectedChapter={selectedChapter}
          onSaveQuiz={handleSaveQuiz}
        />
      </Modal>

      <AlertDialog
        isOpen={showLeaveConfirmation}
        onClose={handleCancelLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Would you like to save before leaving?"
        onConfirm={handleConfirmLeave}
        confirmText="Save & Leave"
        cancelText="Stay"
        showImage={false}
      />

      <AlertDialog
        isOpen={showEditConfirmation}
        onClose={handleCancelEdit}
        title="Edit Image"
        description="Would you like to edit this image using the Image Editor?"
        onConfirm={handleConfirmEdit}
        confirmText="Edit Image"
        cancelText="Cancel"
        showImage={true}
        imageUrl={pendingImageUrl || ""}
      />

      <AlertDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        title="Delete Chapter"
        description={`Are you sure you want to delete ${
          chapterToDelete !== -1 && chapters[chapterToDelete]
            ? parseChapterTitle(chapters[chapterToDelete])
            : "this chapter"
        }? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Chapter"
        cancelText="Cancel"
        showImage={false}
        confirmStyle="outline"
      />
    </React.Fragment>
  );

  // Helper function to extract title for the confirmation dialog
  function parseChapterTitle(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Check if this is a cover chapter
      const isCover =
        html.includes('data-cover="true"') || html.includes("book-cover-image");

      if (isCover) return "Course Cover";

      // Get chapter title from h1
      const titleElement = doc.querySelector("h1");
      return titleElement?.textContent || "this chapter";
    } catch (e) {
      return "this chapter";
    }
  }
};

export default EditCoursePage;
