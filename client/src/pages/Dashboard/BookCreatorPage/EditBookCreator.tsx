import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import { Book, ImageIcon, PackagePlus, ShieldCloseIcon, Loader2, Save } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ChapterGallery from "../CourseCreatorPage/ChapterGallery";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";
import { GenerateQuiz } from "../../../components/GenerateQuiz";
import {
  processChapterSelection,
  handleContentUpdate,
  updateEditorImage,
  generateCoverContent,
  isCoverChapter,
  extractChapterTitle,
  formatQuizContent
} from '../../../utilities/shared/editorUtils';
import { QuizDisplay } from "../../../components/QuizDisplay";
import { determineQuizType, formatQuizHTML } from "../../../utilities/shared/quizUtils";


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

const EditBookCreator = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [AIImage, setAiIMage] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(-1);
  const [chapters, setChapters] = useState<string[]>([]); 
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>("");
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(null);
  const quillRef = useRef<ReactQuill>(null);
  const [showEditConfirmation, setShowEditConfirmation] = useState<boolean>(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [chapterToDelete, setChapterToDelete] = useState<number>(-1);
  const [OpenQuizModal, setOpenQuizModal] = useState<boolean>(false);
  // Add these with existing state declarations
const [currentQuizContent, setCurrentQuizContent] = useState<{
  editorContent: string;
  sharedContent: string;
} | null>(null);
 
const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] = useState<number>(-1);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();
  
  // Add this effect to warn users before they leave with unsaved changes
  useEffect(() => {
    // Function to handle navigation attempts
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way to show a browser confirm dialog before navigation
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // Function to intercept navigation attempts within the React app
    const handleNavigation = (e: MouseEvent) => {
      // Check if the click is on an anchor tag or a button that might navigate away
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      const button = target.closest('button');
      
      if ((anchor && anchor.getAttribute('href')?.startsWith('/')) || 
          (button && button.getAttribute('data-nav'))) {
        
        if (hasUnsavedChanges) {
          e.preventDefault();
          
          if (window.confirm('You have unsaved changes. Do you want to save your course before you leave the page?')) {
            // Save content first, then navigate
            handleSave().then(() => {
              const destination = anchor ? anchor.getAttribute('href') : 
                                  button ? button.getAttribute('data-nav') : '/dashboard';
              navigate(destination || '/dashboard');
            });
          } else {
            // User chose not to save, proceed with navigation
            const destination = anchor ? anchor.getAttribute('href') : 
                                button ? button.getAttribute('data-nav') : '/dashboard';
            navigate(destination || '/dashboard');
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleNavigation, true);

    return () => {
      // Clean up event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleNavigation, true);
    };
  }, [hasUnsavedChanges, navigate]);

  

  // Modify save handler to reset unsaved changes flag
  // const handleSave = async () => {
  //   try {
  //     if (selectedChapterIndex === -1) return;

  //     const updatedChapters = [...chapters];
  //     const updatedContent = handleContentUpdate(
  //       selectedChapter, 
  //       selectedChapterTitle,
  //       Boolean(currentQuizContent),
  //       chapters[selectedChapterIndex]
  //     );
      
  //     updatedChapters[selectedChapterIndex] = updatedContent;

  //     const response = await apiService.post(
  //       `/course-creator/updateCourse/${id}/book`,
  //       {
  //         content: Array.isArray(updatedChapters) ? JSON.stringify(updatedChapters) : updatedChapters
  //       }
  //     );

  //     if (response.success) {
  //       setChapters(updatedChapters);
  //       setHasUnsavedChanges(false); // Reset the unsaved changes flag
  //       toast.success('Changes saved successfully');
  //       return true;
  //     } else {
  //       toast.error('Failed to save changes');
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error saving content:", error);
  //     toast.error('Error saving content');
  //     return false;
  //   }
  // };


  const handleSave = async () => {
    try {
      if (selectedChapterIndex === -1) return;

      const updatedChapters = [...chapters];
      const updatedContent = handleContentUpdate(
        selectedChapter, 
        selectedChapterTitle,
        Boolean(currentQuizContent),
        chapters[selectedChapterIndex] // Pass existing content
      );
      
      updatedChapters[selectedChapterIndex] = updatedContent;

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: Array.isArray(updatedChapters) ? JSON.stringify(updatedChapters) : updatedChapters
        }
      );

      if (response.success) {
        setChapters(updatedChapters);
        toast.success('Changes saved successfully');
      } else {
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error('Error saving content');
    }
  };


  const toggleQuizModal = () => {
    setOpenQuizModal(!OpenQuizModal);
  };

console.log(selectedChapter, "-----------")

  // Image click handler with confirmation dialog
  const handleImageClick = (imageUrl: string) => {
    console.log('Image clicked:', imageUrl);
    
    // Always set the pending image and show confirmation dialog
    setPendingImageUrl(imageUrl);
    setShowEditConfirmation(true);
    
    // Important: prevent any direct editing
    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  // Dialog handlers
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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response: any = await apiService.get(
          `/book-creator/getBookById/${id}`,
          {}
        );
        setCourseData(response.data);
        
        // Parse chapters here
        if (response.data?.content) {
          try {
            // First, clean up the string
            const cleanContent = response.data.content
              .replace(/^"/, '') // Remove leading quote
              .replace(/"$/, '') // Remove trailing quote
              .replace(/\\\\/g, '\\') // Fix double escapes
              .replace(/\\"/g, '"'); // Fix escaped quotes

            // Parse the content
            let parsedChapters = JSON.parse(cleanContent);
            
            // Ensure it's an array and clean up each chapter
            if (Array.isArray(parsedChapters)) {
              parsedChapters = parsedChapters.map((chapter: string) => {
                return chapter
                  .replace(/\\n/g, '\n')
                  .replace(/\\\\/g, '\\')
                  .replace(/\\"/g, '"')
                  .trim();
              });
            } else {
              // If not an array, create one with the single chapter
              parsedChapters = [parsedChapters];
            }
            
            setChapters(parsedChapters);
          } catch (e) {
            console.error("Error parsing book content", e);
            setChapters([]);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error fetching book data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleAIImageSelect = (imageUrl: string) => {
    console.log(imageUrl, " Image URL");
    setAiIMage(imageUrl);
    setShowImageGenerator(false);
  };

  // const handleContentChange = (newContent: string) => {
  //   setSelectedChapter(newContent);
  // };

  // Modify content change handler to track unsaved changes
  const handleContentChange = (newContent: string) => {
    // Only mark as unsaved if content actually changed
    if (newContent !== selectedChapter) {
      setHasUnsavedChanges(true);
    }
    setSelectedChapter(newContent);
  };

  const handleChapterSelect = (chapterContent: string, index: number) => {

    console.log(chapterContent, "Chapter Content")
    const {
      isCover,
      content,
      title,
      quizContent,
      index: selectedIndex
    } = processChapterSelection(chapterContent, index);

    
    setSelectedChapterTitle(title);
    setSelectedChapter(content);
    setSelectedChapterIndex(selectedIndex);
    setCurrentQuizContent(quizContent);

  };
  
  

  const handleEditedImageSave = (editedImageUrl: string): void => {
    if (!quillRef.current || !currentEditingImage) return;
    
    const editor = quillRef.current.getEditor();
    if (!editor) return;
  
    const range = editor.getSelection();
    const delta = editor.getContents();
    
    const updatedDelta = updateEditorImage(delta, currentEditingImage, editedImageUrl);
    
    editor.setContents(updatedDelta as any);
    if (range) editor.setSelection(range.index, range.length);
    
    handleContentChange(editor.root.innerHTML);
    handleSave();
  
    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  // Add cover image functionality
  const handleAddCoverImage = async (imageUrl: string) => {
    try {
      // Create a clean cover chapter structure - simple with just the necessary elements
      const coverContent = `
        <div data-cover="true">
          <img 
            src="${imageUrl}" 
            alt="Cover Image" 
            class="book-cover-image"
            style="display: block; width: 100%; max-height: 600px; object-fit: contain;"
            data-cover="true"
          >
        </div>`;
    
      // Handle chapters array modification
      let updatedChapters = [...chapters];
      
      // Check if a cover already exists
      const coverIndex = updatedChapters.findIndex(chapter => 
        chapter.includes('data-cover="true"') || 
        chapter.includes('book-cover-image')
      );
      
      if (coverIndex >= 0) {
        // Replace existing cover
        updatedChapters[coverIndex] = coverContent;
      } else {
        // Insert new cover at beginning
        updatedChapters.unshift(coverContent);
      }
    
      // Make API call to update
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );
    
      if (response.success) {
        // Update local state
        setChapters(updatedChapters);
        
        // Select the cover chapter
        const targetIndex = coverIndex >= 0 ? coverIndex : 0;
        
        // For cover pages, we don't want to display text in the editor
        setSelectedChapterTitle('Book Cover');
        setSelectedChapter(''); // Empty content for editor
        setSelectedChapterIndex(targetIndex);
        
        toast.success('Book cover added successfully');
      } else {
        toast.error('Failed to save book cover');
      }
    } catch (error) {
      console.error('Error saving book cover:', error);
      toast.error('Error saving book cover');
    }
  };

  // Remove cover image functionality
  const handleRemoveCoverImage = async () => {
    try {
      // Find the cover chapter
      const coverIndex = chapters.findIndex(chapter => 
        chapter.includes('data-cover="true"') || 
        chapter.includes('book-cover-image')
      );
      
      if (coverIndex < 0) {
        toast.error('No cover image found');
        return;
      }

      // Create a copy of chapters without the cover
      const updatedChapters = [...chapters];
      updatedChapters.splice(coverIndex, 1);

      // Make API call to update
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );

      if (response.success) {
        // Update local state
        setChapters(updatedChapters);
        
        // Select the first chapter if available
        if (updatedChapters.length > 0) {
          handleChapterSelect(updatedChapters[0], 0);
        } else {
          setSelectedChapter('');
          setSelectedChapterTitle('');
          setSelectedChapterIndex(-1);
        }
        
        toast.success('Book cover removed successfully');
      } else {
        toast.error('Failed to remove book cover');
      }
    } catch (error) {
      console.error('Error removing book cover:', error);
      toast.error('Error removing book cover');
    }
  };

  // Add chapter delete functionality
  const handleDeleteChapter = (index: number) => {
    setChapterToDelete(index);
    setShowDeleteConfirmation(true);
  };

  // Delete confirmation handlers
  const handleConfirmDelete = async () => {
    if (chapterToDelete === -1) return;

    try {
      // Create a copy of chapters without the one to delete
      const updatedChapters = [...chapters];
      updatedChapters.splice(chapterToDelete, 1);

      // Make API call to update
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );

      if (response.success) {
        // Update local state
        setChapters(updatedChapters);
        
        // If the currently selected chapter was deleted
        if (chapterToDelete === selectedChapterIndex) {
          // Select the first available chapter, or clear selection if none left
          if (updatedChapters.length > 0) {
            handleChapterSelect(updatedChapters[0], 0);
          } else {
            setSelectedChapter('');
            setSelectedChapterTitle('');
            setSelectedChapterIndex(-1);
          }
        } 
        // If a chapter before the selected one was deleted, adjust the index
        else if (chapterToDelete < selectedChapterIndex) {
          setSelectedChapterIndex(selectedChapterIndex - 1);
        }
        
        toast.success('Chapter deleted successfully');
      } else {
        toast.error('Failed to delete chapter');
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Error deleting chapter');
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
      sharedContent: sharedQuizHTML
    });
    
    const updatedChapters = [...chapters];
    const finalChapterContent = formatQuizContent(
      editorQuizHTML, 
      sharedQuizHTML, 
      selectedChapterTitle, 
      selectedChapter
    );
    
    updatedChapters[selectedChapterIndex] = finalChapterContent;

    apiService.post(
      `/course-creator/updateCourse/${id}/book`,
      {
        content: JSON.stringify(updatedChapters)
      }
    ).then(response => {
      if (response.success) {
        setChapters(updatedChapters);
        toast.success('Quiz added to chapter successfully!');
      } else {
        toast.error('Failed to save quiz to chapter');
      }
    }).catch(error => {
      console.error('Error saving quiz:', error);
      toast.error('Error saving quiz');
    });
    
    setOpenQuizModal(false);
  };

  // Add the handleRegenerateQuiz function
  // const handleRegenerateQuestion = async (questionIndex: number) => {
  //   if (!selectedChapter || !currentQuizContent) {
  //     toast.error('No quiz content available');
  //     return;
  //   }
  
  //   setRegeneratingQuestionIndex(questionIndex);
    
  //   try {
  //     // Store the original quiz content as backup
  //     const originalQuizContent = {...currentQuizContent};
      
  //     // Create a parser and parse the current chapter HTML
  //     const parser = new DOMParser();
      
  //     // CRITICAL: We need to extract CLEAN chapter content with no quiz data at all
  //     // This will be what we show in the editor and what we use as base for saving
  //     const doc = parser.parseFromString(selectedChapter, 'text/html');
      
  //     // Remove any quiz sections that might already be in the editor
  //     const quizSections = doc.querySelectorAll('h2');
  //     quizSections.forEach(section => {
  //       if (section.textContent?.trim().toLowerCase() === 'exercises') {
  //         let currentNode = section as any;
  //         const nodesToRemove = [];
  //         nodesToRemove.push(currentNode);
          
  //         while (currentNode.nextElementSibling) {
  //           currentNode = currentNode.nextElementSibling;
  //           nodesToRemove.push(currentNode);
  //           if (currentNode.tagName === 'H2') break;
  //         }
          
  //         nodesToRemove.forEach(node => {
  //           if (node.parentNode) node.parentNode.removeChild(node);
  //         });
  //       }
  //     });
      
  //     // Get the clean chapter content without any quiz sections
  //     const cleanContent = doc.body.innerHTML;
  //     const textContent = doc.body.textContent || '';
  //     const quizType = determineQuizType(currentQuizContent.sharedContent);
      
  //     const response = await apiService.post('/generate-quiz', {
  //       chapterContent: textContent,
  //       quizType,
  //       questionCount: 1,
  //       preserveStructure: true,
  //       questionIndex
  //     }, { timeout: 60000 });
  
  //     if (response.success && response.data) {
  //       try {
  //         // Format the quiz HTML with the new question
  //         const formattedQuiz = await formatQuizHTML({
  //           ...response.data,
  //           existingQuiz: currentQuizContent,
  //           replaceQuestionIndex: questionIndex
  //         });
  
  //         // Update the quiz content state to show in the separate display
  //         setCurrentQuizContent({
  //           editorContent: formattedQuiz.editorQuizHTML,
  //           sharedContent: formattedQuiz.sharedQuizHTML
  //         });
  
  //         // IMPORTANT: Create the final chapter content with ONLY the clean content
  //         // in the visible editor part, and proper quiz content as metadata
  //         const updatedChapters = [...chapters];
  //         const finalChapterContent = formatQuizContent(
  //           formattedQuiz.editorQuizHTML,  // This contains just the quiz questions for editor
  //           formattedQuiz.sharedQuizHTML,  // This contains the interactive quiz
  //           selectedChapterTitle,
  //           cleanContent              // This is the clean chapter content WITHOUT any quiz sections
  //         );
          
  //         updatedChapters[selectedChapterIndex] = finalChapterContent;
  
  //         const saveResponse = await apiService.post(
  //           `/course-creator/updateCourse/${id}/book`,
  //           {
  //             content: JSON.stringify(updatedChapters)
  //           }
  //         );
  
  //         if (saveResponse.success) {
  //           setChapters(updatedChapters);
            
  //           // CRITICAL: Update the editor to show only the clean content,
  //           // NOT the content with the quiz embedded
  //           setSelectedChapter(cleanContent);
            
  //           toast.success('Question regenerated successfully');
  //         } else {
  //           // Revert to original quiz content on save failure
  //           setCurrentQuizContent(originalQuizContent);
  //           toast.error('Failed to save regenerated question');
  //         }
  //       } catch (error) {
  //         console.error('Error processing regenerated question:', error);
  //         setCurrentQuizContent(originalQuizContent);
  //         toast.error('Failed to process regenerated question');
  //       }
  //     } else {
  //       toast.error(response.message || 'Failed to regenerate question');
  //     }
  //   } catch (error) {
  //     console.error('Error regenerating question:', error);
  //     toast.error('Error regenerating question');
  //   } finally {
  //     setRegeneratingQuestionIndex(-1);
  //   }
  // };
  const handleRegenerateQuestion = async (questionIndex: number) => {
    if (!selectedChapter || !currentQuizContent) {
      toast.error('No quiz content available');
      return;
    }
  
    setRegeneratingQuestionIndex(questionIndex);
    
    try {
      // Store the original quiz content as backup
      const originalQuizContent = {...currentQuizContent};
      
      // Create a parser and parse the current chapter HTML
      const parser = new DOMParser();
      
      // CRITICAL: We need to extract CLEAN chapter content with no quiz data at all
      // This will be what we show in the editor and what we use as base for saving
      const doc = parser.parseFromString(selectedChapter, 'text/html');
      
      // Remove any quiz sections that might already be in the editor
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
      
      // Get the clean chapter content without any quiz sections
      const cleanContent = doc.body.innerHTML;
      const textContent = doc.body.textContent || '';
      const quizType = determineQuizType(currentQuizContent.sharedContent);
      
      const response = await apiService.post('/generate-quiz', {
        chapterContent: textContent,
        quizType,
        questionCount: 1,
        preserveStructure: true,
        questionIndex
      }, { timeout: 60000 });
  
      if (response.success && response.data) {
        try {
          // Format the quiz HTML with the new question
          const formattedQuiz = await formatQuizHTML({
            ...response.data,
            existingQuiz: currentQuizContent,
            replaceQuestionIndex: questionIndex
          });
  
          // IMPORTANT FIX: Ensure the editor content has the h2 heading
          let editorContent = formattedQuiz.editorQuizHTML;
          if (!editorContent.trim().startsWith('<h2>Exercises</h2>')) {
            editorContent = `<h2>Exercises</h2>${editorContent}`;
          }
  
          // Update the quiz content state to show in the separate display
          setCurrentQuizContent({
            editorContent: editorContent,
            sharedContent: formattedQuiz.sharedQuizHTML
          });
  
          // IMPORTANT: Create the final chapter content with ONLY the clean content
          // in the visible editor part, and proper quiz content as metadata
          const updatedChapters = [...chapters];
          const finalChapterContent = formatQuizContent(
            editorContent,  // Using our fixed editor content
            formattedQuiz.sharedQuizHTML,  // This contains the interactive quiz
            selectedChapterTitle,
            cleanContent     // This is the clean chapter content WITHOUT any quiz sections
          );
          
          updatedChapters[selectedChapterIndex] = finalChapterContent;
  
          const saveResponse = await apiService.post(
            `/course-creator/updateCourse/${id}/book`,
            {
              content: JSON.stringify(updatedChapters)
            }
          );
  
          if (saveResponse.success) {
            setChapters(updatedChapters);
            
            // CRITICAL: Update the editor to show only the clean content,
            // NOT the content with the quiz embedded
            setSelectedChapter(cleanContent);
            
            toast.success('Question regenerated successfully');
          } else {
            // Revert to original quiz content on save failure
            setCurrentQuizContent(originalQuizContent);
            toast.error('Failed to save regenerated question');
          }
        } catch (error) {
          console.error('Error processing regenerated question:', error);
          setCurrentQuizContent(originalQuizContent);
          toast.error('Failed to process regenerated question');
        }
      } else {
        toast.error(response.message || 'Failed to regenerate question');
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      toast.error('Error regenerating question');
    } finally {
      setRegeneratingQuestionIndex(-1);
    }
  };

  const handleDeleteQuiz = async () => {
    if (selectedChapterIndex === -1 || !currentQuizContent) {
      toast.error('No quiz available to delete');
      return;
    }
  
    try {
      // Get the current chapter HTML
      const originalChapter = chapters[selectedChapterIndex];
      
      // STEP 1: Remove visible quiz content from the editor view
      // Parse the HTML to properly manipulate the DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(selectedChapter, 'text/html');
      
      // Find and remove only quiz sections from the editor content
      const quizSections = doc.querySelectorAll('h2');
      let quizFound = false;
      
      quizSections.forEach(section => {
        if (section.textContent?.trim().toLowerCase() === 'exercises') {
          quizFound = true;
          let currentNode = section as any;
          const nodesToRemove = [];
          nodesToRemove.push(currentNode);
          
          // Mark subsequent nodes for removal until the next h2 or end
          while (currentNode.nextElementSibling) {
            currentNode = currentNode.nextElementSibling;
            nodesToRemove.push(currentNode);
            if (currentNode.tagName === 'H2') break;
          }
          
          // Remove the marked nodes
          nodesToRemove.forEach(node => {
            if (node.parentNode) node.parentNode.removeChild(node);
          });
        }
      });
      
      // Get the clean content for the editor view
      const cleanEditorContent = doc.body.innerHTML;
      
      // STEP 2: Remove ALL quiz data from the chapter content
      let cleanChapterContent = originalChapter
        // Remove the editor quiz section (<h2>Exercises</h2> and everything after it until the next heading)
        .replace(/<h2>Exercises<\/h2>[\s\S]*?(?=<h2>|<!-- SHARED_QUIZ_START -->|$)/, '')
        // Remove the shared quiz section with markers 
        .replace(/<!-- SHARED_QUIZ_START -->[\s\S]*?<!-- SHARED_QUIZ_END -->/, '')
        // Remove any quiz data comments
        .replace(/<!-- quiz data:[\s\S]*?-->/, '')
        // Clean up any double spaces or line breaks that might be left
        .replace(/\s+/g, ' ')
        .trim();
        
      // Verify the content is actually cleaned
      const hasQuizContent = cleanChapterContent.includes('<h2>Exercises</h2>') || 
                            cleanChapterContent.includes('<!-- SHARED_QUIZ_START -->') ||
                            cleanChapterContent.includes('quiz data:');
                            
      if (hasQuizContent) {
        console.warn('Quiz content still detected after cleaning, applying stronger cleaning methods');
        
        // More aggressive cleaning if needed
        cleanChapterContent = cleanChapterContent
          .replace(/<h2>Exercises<\/h2>[\s\S]*/, '')
          .replace(/<!-- SHARED_QUIZ_START -->[\s\S]*/, '')
          .replace(/<!--[\s\S]*?quiz[\s\S]*?-->/, '');
      }
      
      // STEP 3: Update the chapter with clean content
      const updatedChapters = [...chapters];
      updatedChapters[selectedChapterIndex] = cleanChapterContent;
  
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );
      
      if(response.success) {
        // Update local state
        setChapters(updatedChapters);
        setCurrentQuizContent(null);
        
        // Update the editor with the clean content
        setSelectedChapter(cleanEditorContent);
        
        console.log('Quiz successfully deleted, chapter content cleaned');
        toast.success('Quiz deleted successfully');
      } else {
        toast.error('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Error deleting quiz');
    }
  };


  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>
    {/* Main container with responsive layout changes */}
    <div className="flex flex-col p-2 md:p-4 gap-4 lg:gap-6 max-w-full overflow-hidden">
      {/* Chapter gallery - Appears at the top on mobile, moved to side on larger screens */}
      <div className="w-full lg:hidden">
        <ChapterGallery
          chapters={chapters}
          onSelectChapter={handleChapterSelect}
          onDeleteChapter={handleDeleteChapter}
        />
      </div>
      
      {/* Main editor area and sidebar container for lg+ screens */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main editing area */}
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-md overflow-hidden w-full lg:max-w-4xl">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <h2 className="text-xl font-bold text-purple-600 truncate">Edit Chapter</h2>
            </div>
            
            {/* Actions toolbar */}
            <div className="flex flex-wrap items-center text-purple-600 gap-2">
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={toggleQuizModal}
              >
                <PackagePlus className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Create Quiz</span>
              </Button>
    
              <GenerateCover onCoverImageGenerated={handleAddCoverImage}/>
              
              <div className="text-purple-600">
                <Button
                  variant="soft"
                  size="sm"
                  ref={buttonRef}
                  onClick={() => setShowImageGenerator(!showImageGenerator)}
                  className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                  title={showImageGenerator ? "Hide AI Image Generator" : "Generate AI Image"}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap">Generate Image</span>
                </Button>
              </div>
              
              {selectedChapterIndex !== -1 && 
              chapters[selectedChapterIndex] && 
              (chapters[selectedChapterIndex].includes('data-cover="true"') || 
               chapters[selectedChapterIndex].includes('book-cover-image')) && (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={handleRemoveCoverImage}
                  className="bg-red-100 hover:bg-red-200 transition flex items-center gap-1"
                  title="Remove cover image"
                >
                  <ShieldCloseIcon className="w-4 h-4 text-red-600" />
                  <span className="text-xs whitespace-nowrap">Remove Cover</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Save button - now full width on mobile, right-aligned on desktop */}
          <div className="flex justify-end mb-4">
            <Button 
              onClick={handleSave} 
              className="w-full md:w-auto btn-primary bg-primary text-white flex items-center justify-center gap-2 px-4 py-2
                        rounded shadow hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Content</span>
            </Button>
          </div>
          
          {/* Rich text editor - with proper container to handle responsiveness */}
          <div className="w-full overflow-hidden">
            <RichTextEditor
              ref={quillRef}
              initialContent={selectedChapter}
              imageUrl={AIImage}
              id={Number(id)}
              onContentChange={handleContentChange}
              onSave={handleSave}
              onImageClick={handleImageClick}
            />
          </div>
    
          {/* Quiz display area - conditionally shown */}
          {currentQuizContent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Chapter Quiz</h3>
              <QuizDisplay
                quizContent={currentQuizContent}
                onRegenerateQuestion={handleRegenerateQuestion}
                regeneratingQuestionIndex={regeneratingQuestionIndex}
                onDeleteQuiz={handleDeleteQuiz}
              />
            </div>
          )}
        </div>
        
        {/* Chapter gallery - Only visible on large screens */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <ChapterGallery
            chapters={chapters}
            onSelectChapter={handleChapterSelect}
            onDeleteChapter={handleDeleteChapter}
          />
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
        initialImageUrl={currentEditingImage || ''}
        onSave={handleEditedImageSave}
      />
    </Modal>
    
    <Modal 
      isOpen={showImageGenerator}
      onClose={() => setShowImageGenerator(false)}
      title="AI Image Generator"
    >
      <ImageGenerator 
        onImageSelect={handleAIImageSelect} 
        isEditorContext={true}
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
      isOpen={showEditConfirmation}
      onClose={handleCancelEdit}
      title="Edit Image"
      description="Would you like to edit this image using the Image Editor?"
      onConfirm={handleConfirmEdit}
      confirmText="Edit Image"
      cancelText="Cancel"
      showImage={true}
      imageUrl={pendingImageUrl || ''}
    />
    
    <AlertDialog
      isOpen={showDeleteConfirmation}
      onClose={handleCancelDelete}
      title="Delete Chapter"
      description={`Are you sure you want to delete ${
        chapterToDelete !== -1 && chapters[chapterToDelete] ? 
          parseChapterTitle(chapters[chapterToDelete]) : 
          'this chapter'
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
      const doc = parser.parseFromString(html, 'text/html');
      
      // Check if this is a cover chapter
      const isCover = html.includes('data-cover="true"') || 
                      html.includes('book-cover-image');
      
      if (isCover) return 'Book Cover';
      
      // Get chapter title from h1
      const titleElement = doc.querySelector('h1');
      return titleElement?.textContent || 'this chapter';
    } catch (e) {
      return 'this chapter';
    }
  }
};

export default EditBookCreator;



