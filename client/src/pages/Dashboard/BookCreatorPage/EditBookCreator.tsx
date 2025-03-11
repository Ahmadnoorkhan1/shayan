import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import { Book, EditIcon, ImageIcon, ShieldCloseIcon } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ChapterGallery from "../CourseCreatorPage/ChapterGallery";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";

interface QuillEditor {
  getContents: () => Delta;
  setContents: (delta: Delta) => void;
  root: HTMLElement;
  getSelection: () => { index: number; length: number } | null;
  setSelection: (index: number, length: number) => void;
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapterContent, 'text/html');
    
    // Special handling for cover pages
    const isCover = chapterContent.includes('data-cover="true"') || 
                    chapterContent.includes('book-cover-image');
    
    if (isCover) {
      // For cover images, we set a placeholder text in editor
      const coverImg = doc.querySelector('.book-cover-image');
      const imgSrc = coverImg?.getAttribute('src') || '';
      
      // Create a simplified representation for the editor
      const placeholder = `<div style="text-align: center; padding: 20px;">
        <img src="${imgSrc}" style="max-width: 100%; max-height: 400px; margin: 0 auto;" />
      </div>`;
      
      setSelectedChapterTitle('Book Cover');
      setSelectedChapter(placeholder);
      setSelectedChapterIndex(index);
      return;
    }
    
    // Normal chapter handling
    const titleElement = doc.querySelector('h1');
    const title = titleElement?.textContent || `Chapter ${index + 1}`;
    
    // Remove h1 from content before setting it
    if (titleElement) {
      titleElement.remove();
    }
    
    setSelectedChapterTitle(title);
    setSelectedChapter(doc.body.innerHTML);
    setSelectedChapterIndex(index);
  };
  
  const handleSave = async () => {
    try {
      if (selectedChapterIndex === -1) {
        console.error("No chapter selected");
        return;
      }
  
      // Create a copy of chapters array
      const updatedChapters = [...chapters];
      
      // Only modify the selected chapter
      let updatedContent = `<h1>${selectedChapterTitle}</h1>${selectedChapter}`;
  
      // Check if the content has proper HTML structure
      const hasHtmlStructure = selectedChapter.includes('<h1>') || selectedChapter.includes('<h2>');
      
      if (!hasHtmlStructure) {
        // If no HTML structure, wrap the content properly
        updatedContent = `<h1>${courseData?.book_title || 'Chapter ' + (selectedChapterIndex + 1)}</h1>
  <h2>Section 1</h2>
  ${selectedChapter}`;
      }
  
      // Clean up any potential JSON stringify artifacts and escape characters
      updatedContent = updatedContent
        .replace(/\\"/g, '"')  // Remove escaped quotes
        .replace(/\\\\/g, '\\') // Remove double escapes
        .replace(/\\n/g, '\n') // Convert escape sequences to actual newlines
        .trim();
      
      // Update only the selected chapter
      updatedChapters[selectedChapterIndex] = updatedContent;
  
      // Make API call to update
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: Array.isArray(updatedChapters) ? JSON.stringify(updatedChapters) : updatedChapters
        }
      );
  
      if (response.success) {
        // Update local state with cleaned chapters
        setChapters(updatedChapters);
        toast.success('Changes saved successfully');
      } else {
        console.error("Failed to save content:", response.message);
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error('Error saving content');
    }
  };

  const handleEditedImageSave = (editedImageUrl: string): void => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    if (!editor || !currentEditingImage) return;
  
    // Get the current selection range
    const range = editor.getSelection();
  
    // Find all images in the editor
    const delta = editor.getContents();
    const updatedDelta: Delta = { ops: [] };
    let imageFound = false;
  
    // Replace the specific image while maintaining other content
    delta.ops.forEach((op: Operation) => {
      if (!imageFound && op.insert?.image === currentEditingImage) {
        updatedDelta.ops.push({
          insert: { image: editedImageUrl }
        });
        imageFound = true;
      } else {
        updatedDelta.ops.push(op);
      }
    });
  
    // Update editor content
    editor.setContents(updatedDelta as any);
    
    // Restore selection if it existed
    if (range) {
      editor.setSelection(range.index, range.length);
    }
  
    // Force editor update
    const newContent = editor.root.innerHTML;
    handleContentChange(newContent);
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
              <span className="text-sm text-gray-700">AI Image</span>
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