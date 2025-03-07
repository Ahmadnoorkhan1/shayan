// language: tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import { Book, Edit2Icon, EditIcon, ImageIcon, ShieldCloseIcon } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
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

  // Add handler for image click in editor
  const handleImageClick = (imageUrl: string) => {
    setCurrentEditingImage(imageUrl);
    setOpenEditor(true);
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
          const cleanContent = response?.data?.content
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
      // Create properly structured HTML content for cover image - optimized for PDF export
      const coverContent = `
        <h1>Course Cover</h1>
        <div class="content">
          <img 
            src="${imageUrl}" 
            alt="Course Cover" 
            class="book-cover-image"
            style="display: block; width: 100%; max-height: 600px; object-fit: contain;"
          >
        </div>`;
  
      // Handle chapters array modification
      let updatedChapters = [...chapters];
      
      if (updatedChapters.length === 0) {
        updatedChapters = [coverContent];
      } else if (updatedChapters[0].includes('book-cover-image')) {
        updatedChapters[0] = coverContent;
      } else {
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
        
        // Auto-select cover chapter
        handleChapterSelect(coverContent, 0);
        
        // Update title
        setSelectedChapterTitle('Course Cover');
        
        toast.success('Course cover added successfully');
      } else {
        toast.error('Failed to save course cover');
      }
  
    } catch (error) {
      console.error('Error saving course cover:', error);
      toast.error('Error saving course cover');
    }
  };


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
          {/* <Button
              color="destructive"
              variant="soft"
              size="sm"
              // ref={buttonRef}
              onClick={() => setOpenEditor(!openEditor)}
              // className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
              // title={
              //   showImageGenerator
              //     ? "Hide AI Image Generator"
              //     : "Generate AI Image"
              // }
            >
              <EditIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm ml-2 text-gray-700">Image Editor</span>
            </Button> */}

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

          <Modal 
            isOpen={showImageGenerator}
            onClose={() => setShowImageGenerator(false)}
            title="AI Image Generator"
          >
            <ImageGenerator onImageSelect={handleAIImageSelect} />
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
        // onSelectSection={handleSectionSelect}
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
    </React.Fragment>
  );
};

export default EditCoursePage;