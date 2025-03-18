import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import { Book, ImageIcon, PackagePlus, ShieldCloseIcon, Loader2 } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";
import { GenerateQuiz } from "../../../components/GenerateQuiz";
// import { formatQuizHTML } from '../../utilities/shared/quizUtils';
// import { formatQuizHTML } from "../../../utilities/shared/editorUtils";

import {
  processChapterSelection,
  handleContentUpdate,
  updateEditorImage,
  generateCoverContent,
  isCoverChapter,
  extractChapterTitle,
  formatQuizContent
} from '../../../utilities/shared/editorUtils';
import { determineQuizType, formatQuizHTML } from "../../../utilities/shared/quizUtils";
import { QuizDisplay } from "../../../components/QuizDisplay";

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
  const [currentQuizContent, setCurrentQuizContent] = useState<{
    editorContent: string;
    sharedContent: string;
  } | null>(null);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  // Add new state for tracking question regeneration
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] = useState<number>(-1);

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
            if(typeof(parsed) === "string") {
              const again = JSON.parse(parsed);
              setChapters(again);
            } else {
              setChapters(parsed);
            }
          } catch (e) {
            console.error("Error parsing course content", e);
            setChapters([]);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error fetching course data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleAIImageSelect = (imageUrl: string) => {
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
        Boolean(currentQuizContent)
      );
      
      updatedChapters[selectedChapterIndex] = updatedContent;

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
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

  const handleAddCoverImage = async (imageUrl: string) => {
    try {
      const coverContent = generateCoverContent(imageUrl);
      let updatedChapters = [...chapters];
      
      const coverIndex = updatedChapters.findIndex(chapter => isCoverChapter(chapter));
      
      if (coverIndex >= 0) {
        updatedChapters[coverIndex] = coverContent;
      } else {
        updatedChapters.unshift(coverContent);
      }
    
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );
    
      if (response.success) {
        setChapters(updatedChapters);
        const targetIndex = coverIndex >= 0 ? coverIndex : 0;
        
        setSelectedChapterTitle('Course Cover');
        setSelectedChapter('');
        setSelectedChapterIndex(targetIndex);
        
        toast.success('Course cover added successfully');
      } else {
        toast.error('Failed to save course cover');
      }
    } catch (error) {
      console.error('Error saving course cover:', error);
      toast.error('Error saving course cover');
    }
  };

  const handleRemoveCoverImage = async () => {
    try {
      const coverIndex = chapters.findIndex(chapter => isCoverChapter(chapter));
      
      if (coverIndex < 0) {
        toast.error('No cover image found');
        return;
      }

      const updatedChapters = [...chapters];
      updatedChapters.splice(coverIndex, 1);

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );

      if (response.success) {
        setChapters(updatedChapters);
        
        if (updatedChapters.length > 0) {
          handleChapterSelect(updatedChapters[0], 0);
        } else {
          setSelectedChapter('');
          setSelectedChapterTitle('');
          setSelectedChapterIndex(-1);
        }
        
        toast.success('Course cover removed successfully');
      } else {
        toast.error('Failed to remove course cover');
      }
    } catch (error) {
      console.error('Error removing course cover:', error);
      toast.error('Error removing course cover');
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
          content: JSON.stringify(updatedChapters)
        }
      );

      if (response.success) {
        setChapters(updatedChapters);
        
        if (chapterToDelete === selectedChapterIndex) {
          if (updatedChapters.length > 0) {
            handleChapterSelect(updatedChapters[0], 0);
          } else {
            setSelectedChapter('');
            setSelectedChapterTitle('');
            setSelectedChapterIndex(-1);
          }
        } else if (chapterToDelete < selectedChapterIndex) {
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
      `/course-creator/updateCourse/${id}/course`,
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

  const handleRegenerateQuiz = async () => {
    if (!selectedChapter) {
      toast.error('No chapter content available');
      return;
    }
  
    setIsRegeneratingQuiz(true);
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedChapter;
      const textContent = tempDiv.textContent || '';
  
      const response = await apiService.post('/generate-quiz', {
        chapterContent: textContent,
        quizType: currentQuizContent?.sharedContent.includes('flash-card') ? 'flip-card' : 'multiple-choice',
        questionCount: 5
      }, { timeout: 60000 });
  
      if (response.success && response.data) {
        const { editorQuizHTML, sharedQuizHTML } = await formatQuizHTML(response?.data);
        // const { editorQuizHTML, sharedQuizHTML } = response.data;
        handleSaveQuiz(editorQuizHTML, sharedQuizHTML);
        toast.success('Quiz regenerated successfully');
      } else {
        toast.error(response.message || 'Failed to regenerate quiz');
      }
    } catch (error) {
      console.error('Error regenerating quiz:', error);
      toast.error('Error regenerating quiz');
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  // Add new handler for regenerating individual questions
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
  
      // Generate a single question
      const response = await apiService.post('/generate-quiz', {
        chapterContent: textContent,
        quizType: determineQuizType(currentQuizContent.sharedContent),
        questionCount: 1,
        preserveStructure: true,
        questionIndex
      }, { timeout: 60000 });
  
      if (response.success && response.data) {
        const { editorQuizHTML, sharedQuizHTML } = await formatQuizHTML({
          ...response.data,
          existingQuiz: currentQuizContent,
          replaceQuestionIndex: questionIndex
        });
        
        handleSaveQuiz(editorQuizHTML, sharedQuizHTML);
        toast.success('Question regenerated successfully');
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

  console.log(currentQuizContent, "++++++++++++++++++++++")

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>
    <div className="flex flex-col sm:flex-row p-4 space-y-6 sm:space-y-0 sm:space-x-6">
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-purple-800">Edit Chapter</h2>
          </div>
          <div className=" flex relative">
         

<Button
color="destructive"
variant="soft"
size="sm"
className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
onClick={toggleQuizModal}

>
<PackagePlus className="w-5 h-5 text-gray-600" />
<span className="text-[12px] text-gray-700">Create Quiz</span></Button>
            

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
              <span className="text-[12px] text-gray-700">Generate AI Image</span>
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
      <span className="text-[12px] text-red-700">Remove Cover</span>
    </Button>
)}



<Modal 
  isOpen={showImageGenerator}
  onClose={() => setShowImageGenerator(false)}
  title="AI Image Generator"
>
  <ImageGenerator 
    onImageSelect={handleAIImageSelect} 
    isEditorContext={true} // Set to true for text editor usage
  />
</Modal>
          </div>
        </div>
        <RichTextEditor
         ref={quillRef}
          initialContent={selectedChapter}
          imageUrl={AIImage}
          id={Number(id)}
          onContentChange={handleContentChange}
          onSave={handleSave}
          onImageClick={handleImageClick}
        />

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
        onDeleteChapter={handleDeleteChapter} // Add this prop
      />
    </div>
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
      <Modal isOpen={OpenQuizModal} onClose={toggleQuizModal} title="Create Quiz">
  <GenerateQuiz  selectedChapter={selectedChapter} onSaveQuiz={handleSaveQuiz} />
</Modal>
        {/* Add the Alert Dialog for image editing confirmation */}
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
      
      {/* Chapter delete confirmation dialog */}
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
      
      if (isCover) return 'Course Cover';
      
      // Get chapter title from h1
      const titleElement = doc.querySelector('h1');
      return titleElement?.textContent || 'this chapter';
    } catch (e) {
      return 'this chapter';
    }
  }
};

export default EditCoursePage;