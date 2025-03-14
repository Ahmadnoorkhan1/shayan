// language: tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import { Book, Edit2Icon, EditIcon, ImageIcon, PackagePlus, Paperclip, ShieldCloseIcon } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";
import { GenerateQuiz } from "../../../components/GenerateQuiz";
// import { toast } from "react-toastify";



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
  const buttonRef = useRef<HTMLButtonElement>(null); // Add this ref
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


  const toggleQuizModal = () => {
    setOpenQuizModal(!OpenQuizModal)
  }

  // Update the handleImageClick function to handle all image clicks consistently
// Update the handleImageClick function to ensure it always shows the dialog
const handleImageClick = (imageUrl: string) => {
  // We need to ensure we're not directly opening the editor
  console.log('Image clicked:', imageUrl); // Add for debugging
  
  // Always set the pending image and show confirmation dialog
  setPendingImageUrl(imageUrl);
  setShowEditConfirmation(true);
  
  // Important: prevent any direct editing
  setOpenEditor(false);
  setCurrentEditingImage(null);
};

  // Add these handlers for the dialog
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

  // Fetch course data
// In the same file, update the useEffect for fetching course data
useEffect(() => {
  const fetchCourse = async () => {
    try {
      const response: any = await apiService.get(
        `/course-creator/getCourseById/${id}/course`,
        {}
      );
      setCourseData(response.data);
      
      // Parse chapters here
      if (response.data?.content) {
        try {
          // First, clean up the string
// console.log(typeof (response?.data?.content)  , "===================>")

const parsed = JSON.parse(response?.data?.content);

if(typeof(parsed) === "string") {
  const again = JSON.parse(parsed)
  console.log(again, "again")
  setChapters(again) ;
} else {
  setChapters(parsed) ;
}

// const again = JSON.parse(parsed)


      // const validJsonStr = again?.replace(/'/g, '"');

      // console.log(again, "again")
      // const parsedContent = JSON.parse(again);

          // const parsedContent = (response?.data?.content);
          // setChapters(again) ;
          
          // return
          // const cleanContent = response?.data?.content
          //   .replace(/^"/, '') // Remove leading quote
          //   .replace(/"$/, '') // Remove trailing quote
          //   .replace(/\\\\/g, '\\') // Fix double escapes
          //   .replace(/\\"/g, '"'); // Fix escaped quotes
          // let parsedChapters = JSON.parse(cleanContent);
          // // Ensure it's an array and clean up each chapter
          // if (Array.isArray(parsedChapters)) {
          //   parsedChapters = parsedChapters.map((chapter: string) => {
          //     return chapter
          //       .replace(/\\n/g, '\n')
          //       .replace(/\\\\/g, '\\')
          //       .replace(/\\"/g, '"')
          //       .trim();
          //   });
          // } else {
          //   // If not an array, create one with the single chapter
          //   parsedChapters = [parsedChapters];
          // }
          
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
    console.log(imageUrl, " Image URL");
    setAiIMage(imageUrl);
    setShowImageGenerator(false);
  };

  console.log(AIImage, " AI Image");

  const handleSectionSelect = (sectionContent: string) => {
    setSelectedChapter(sectionContent);
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
      
      setSelectedChapterTitle('Course Cover');
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


  // const handleChapterSelect = (chapterContent: string, index: number) => {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(chapterContent, 'text/html');
    
  //   // Special handling for cover pages
  //   const isCover = chapterContent.includes('data-cover="true"') || 
  //                   chapterContent.includes('book-cover-image');
    
  //   if (isCover) {
  //     // For cover images, we set a placeholder text in editor
  //     const coverImg = doc.querySelector('.book-cover-image');
  //     const imgSrc = coverImg?.getAttribute('src') || '';
      
  //     // Create a simplified representation for the editor that will work with our click handler
  //     // The key here is to ensure the image doesn't have special styling that might intercept clicks
  //     const placeholder = `
  //       <div style="text-align: center; padding: 20px;" class="cover-image-container">
  //         <p style="margin-bottom: 10px; color: #6b7280; font-style: italic;">Course Cover Image (Click to edit)</p>
  //         <img 
  //           src="${imgSrc}" 
  //           class="editor-image book-cover-image-preview" 
  //           style="max-width: 100%; max-height: 400px; margin: 0 auto; cursor: pointer; border: 1px dashed #e5e7eb; padding: 4px;" 
  //           alt="Cover Image"
  //           data-cover-image="true"
  //         />
  //       </div>
  //     `;
      
  //     setSelectedChapterTitle('Course Cover');
  //     setSelectedChapter(placeholder);
  //     setSelectedChapterIndex(index);
  //     return;
  //   }
    
  //   // Normal chapter handling
  //   const titleElement = doc.querySelector('h1');
  //   const title = titleElement?.textContent || `Chapter ${index + 1}`;
    
  //   // Remove h1 from content before setting it
  //   if (titleElement) {
  //     titleElement.remove();
  //   }
    
  //   setSelectedChapterTitle(title);
  //   setSelectedChapter(doc.body.innerHTML);
  //   setSelectedChapterIndex(index);
  // };
  const handleSave = async () => {
    console.log("buton clciked ===================================>")
    try {
      if (selectedChapterIndex === -1) {
        console.error("No chapter selected");
        return;
      }
  
      // Create a copy of chapters array
      const updatedChapters = [...chapters];
      // console.log(updatedChapters)
      // return
      
      // Only modify the selected chapter
      let updatedContent = `<h1>${selectedChapterTitle}</h1>${selectedChapter}`;
  
      // Check if the content has proper HTML structure
      const hasHtmlStructure = selectedChapter.includes('<h1>') || selectedChapter.includes('<h2>');
      
      if (!hasHtmlStructure) {
        // If no HTML structure, wrap the content properly
        updatedContent = `<h1>${courseData?.course_title || 'Chapter ' + (selectedChapterIndex + 1)}</h1>
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
        `/course-creator/updateCourse/${id}/course`,
        {
          // Don't stringify chapters array again if it's already stringified
          content: Array.isArray(updatedChapters) ? JSON.stringify(updatedChapters) : updatedChapters
        }
      );
  
      if (response.success) {
        // Update local state with cleaned chapters
        setChapters(updatedChapters);
      } else {
        console.error("Failed to save content:", response.message);
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

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
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters)
        }
      );
    
      if (response.success) {
        // Update local state
        setChapters(updatedChapters);
        
        // Select the cover chapter
        const targetIndex = coverIndex >= 0 ? coverIndex : 0;
        
        // Call handleChapterSelect with special handling for cover
        const parser = new DOMParser();
        const doc = parser.parseFromString(coverContent, 'text/html');
        
        // For cover pages, we don't want to display text in the editor
        setSelectedChapterTitle('Course Cover');
        setSelectedChapter(''); // Empty content for editor
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

  // Add this function to remove cover image
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
      `/course-creator/updateCourse/${id}/course`,
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

  // Add confirmation handlers
  const handleConfirmDelete = async () => {
    if (chapterToDelete === -1) return;

    try {
      // Create a copy of chapters without the one to delete
      const updatedChapters = [...chapters];
      updatedChapters.splice(chapterToDelete, 1);

      // Make API call to update
      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
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


  const handleSaveQuiz = (editorQuizHTML: string, sharedQuizHTML: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    if (!editor) return;
    
    console.log('Saving quiz to chapter:', editorQuizHTML, sharedQuizHTML);
  
    // Get the current selection range
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();
    
    // Append the editor version of the quiz to the current chapter content
    editor.clipboard.dangerouslyPasteHTML(editor.getLength(), editorQuizHTML);
    
    // Update the content
    const newContent = editor.root.innerHTML;
    handleContentChange(newContent);
    
    // Now, we need to update our chapters array to store both versions
    // First, get the current chapter's HTML
    const updatedChapters = [...chapters];
    const currentChapter = updatedChapters[selectedChapterIndex];
    // Parse the current chapter to extract its content without any quiz elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentChapter, 'text/html');
    
    // Remove any existing quiz elements (for updating scenarios)
    const existingQuizzes = doc.querySelectorAll('.quiz-container, [data-quiz-id], .shared-quiz-data');
    existingQuizzes.forEach(quiz => quiz.remove());
    
    // Extract the chapter title
    const title = selectedChapterTitle || 'Chapter';
  
    // Instead of putting the entire shared quiz HTML in a data attribute,
    // let's create a special comment-based marker that can handle large strings
    const sharedQuizMarker = `
    <!-- SHARED_QUIZ_START -->
    ${sharedQuizHTML}
    <!-- SHARED_QUIZ_END -->
    `;

    
    // Combine everything: chapter with title + editor quiz content + shared quiz marker
    const finalChapterContent = `<h1>${title}</h1>${newContent}${sharedQuizMarker}`;
    
    // Update the chapter in the array
    updatedChapters[selectedChapterIndex] = finalChapterContent;

    console.log('Updated chapters:', updatedChapters);
    // Save the updated chapter
    apiService.post(
      `/course-creator/updateCourse/${id}/course`,
      {
        content: JSON.stringify(updatedChapters)
      }
    ).then(response => {
      if (response.success) {
        // Update local state with the modified chapters
        setChapters(updatedChapters);
        toast.success('Quiz added to chapter successfully!');
      } else {
        toast.error('Failed to save quiz to chapter');
      }
    }).catch(error => {
      console.error('Error saving quiz:', error);
      toast.error('Error saving quiz');
    });
    
    // Close the quiz modal
    setOpenQuizModal(false);
  };

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
              <span className="text-[12px] text-gray-700">AI Image</span>
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