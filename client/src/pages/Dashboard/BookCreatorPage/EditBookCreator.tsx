import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
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


  const toggleQuizModal = () => {
    setOpenQuizModal(!OpenQuizModal);
  };

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

  const handleContentChange = (newContent: string) => {
    setSelectedChapter(newContent);
  };

  const handleChapterSelect = (chapterContent: string, index: number) => {
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
  const handleRegenerateQuestion = async (questionIndex: number) => {
    if (!selectedChapter || !currentQuizContent) {
      toast.error('No quiz content available');
      return;
    }
  
    setRegeneratingQuestionIndex(questionIndex);
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedChapter;
      const textContent = tempDiv.textContent || '';
      const quizType = determineQuizType(currentQuizContent.sharedContent);
      
      const response = await apiService.post('/generate-quiz', {
        chapterContent: textContent,
        quizType,
        questionCount: 1,
        preserveStructure: true,
        questionIndex
      }, { timeout: 60000 });
  
      if (response.success && response.data) {
        // Add the existing quiz content to preserve structure
        const formattedQuiz = await formatQuizHTML({
          ...response.data,
          existingQuiz: currentQuizContent,
          replaceQuestionIndex: questionIndex
        });
  
        // Update quiz content with preserved structure
        setCurrentQuizContent({
          editorContent: formattedQuiz.editorQuizHTML,
          sharedContent: formattedQuiz.sharedQuizHTML
        });
  
        // Update chapter content
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
            content: JSON.stringify(updatedChapters)
          }
        );
  
        if (saveResponse.success) {
          setChapters(updatedChapters);
          toast.success('Question regenerated successfully');
        } else {
          toast.error('Failed to save regenerated question');
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>
    <div className="flex flex-col sm:flex-row p-4 space-y-6 sm:space-y-0 sm:space-x-6">
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-purple-800">Edit Chapter</h2>
          </div>
          <div className="flex relative">
            <Button
              color="destructive"
              variant="soft"
              size="sm"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
              onClick={toggleQuizModal}
            >
              <PackagePlus className="w-5 h-5 text-gray-600" />
              <span className="text-[12px] text-gray-700">Create Quiz</span>
            </Button>

            <GenerateCover onCoverImageGenerated={handleAddCoverImage}/>
            <Button
              color="destructive"
              variant="soft"
              size="sm"
              ref={buttonRef}
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
              title={
                showImageGenerator
                  ? "Hide AI Image Generator"
                  : "Generate AI Image"
              }
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Generate AI Image</span>
            </Button>

            {selectedChapterIndex !== -1 && 
            chapters[selectedChapterIndex] && 
            (chapters[selectedChapterIndex].includes('data-cover="true"') || 
            chapters[selectedChapterIndex].includes('book-cover-image')) && (
              <Button
                color="destructive"
                variant="soft"
                size="sm"
                onClick={handleRemoveCoverImage}
                className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition flex items-center gap-2 ml-2"
                title="Remove cover image"
              >
                <ShieldCloseIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">Remove Cover</span>
              </Button>
            )}
          </div>
        </div>

        <Button 
            onClick={handleSave} 
            className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                      shadow-lg hover:shadow-xl
                      transform transition-all duration-200 hover:-translate-y-0.5 text-base"
          >
            <Save className="w-6 h-6" />
            Save Content
          </Button>
        <RichTextEditor
          ref={quillRef}
          initialContent={selectedChapter}
          imageUrl={AIImage}
          id={Number(id)}
          onContentChange={handleContentChange}
          onSave={handleSave}
          onImageClick={handleImageClick}
        />
        {/* Add the Quiz Display section after RichTextEditor */}
      {currentQuizContent && (
        <QuizDisplay
          quizContent={currentQuizContent}
          onRegenerateQuestion={handleRegenerateQuestion}
          regeneratingQuestionIndex={regeneratingQuestionIndex}
        />
      )}
      </div>
      <ChapterGallery
        chapters={chapters}
        onSelectChapter={handleChapterSelect}
        onDeleteChapter={handleDeleteChapter}
      />
    </div>
    
    {/* Image Editor Modal */}
    <Modal
      isOpen={openEditor}
      onClose={() => {
        setOpenEditor(false);
        setCurrentEditingImage(null);
      }}
      title="Image Editor"
    >
      {currentEditingImage && (
        <ImageEditor
          initialImageUrl={currentEditingImage}
          onSave={handleEditedImageSave}
        />
      )}
    </Modal>

    {/* AI Image Generator Modal */}
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

    {/* Image Edit Confirmation Dialog */}
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
    
    {/* Chapter Delete Confirmation Dialog */}
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

    {/* Add Quiz Modal */}
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