import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save, Edit, Image, ChevronRight, FileText, PanelLeftOpen } from 'lucide-react';

// Register the BlotFormatter2 module with Quill
if (typeof window !== 'undefined') {
  const Quill = ReactQuill.Quill;
  // Make sure we only register once
  if (!Quill.imports['modules/blotFormatter2']) {
    Quill.register('modules/blotFormatter2', BlotFormatter2);
    console.log('BlotFormatter2 registered successfully');
  }
}

interface RichTextEditorProps {
  initialContent: string;
  imageUrl?: string | null;
  id: string | number;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onImageClick?: (imageUrl: string) => void;
}

// Helper function to clean empty list items
// Helper function to clean HTML content
const cleanHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;
  
  // Clean empty list items
  let cleanedContent = htmlContent
    .replace(/<li><br><\/li>/g, '')
    .replace(/<li><p><br><\/p><\/li>/g, '')
    .replace(/<li>\s*<\/li>/g, '')
    .replace(/<ul>\s*<\/ul>/g, '')
    .replace(/<ol>\s*<\/ol>/g, '');
  
  // Remove pre tags but keep their content
  cleanedContent = cleanedContent.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (match, content) => {
    // Return just the content inside the pre tags
    return content;
  });

  // Clean up image tags by removing extra slashes
  cleanedContent = cleanedContent.replace(/<img src=\\"([^"]*)\\" alt=\\"([^"]*)\\" class=\\"([^"]*)\\" width=\\"([^"]*)\\" height=\\"([^"]*)\\"\\>/g, 
    '<img src="$1" alt="$2" class="$3" width="$4" height="$5">');
  
  // Remove any remaining backslashes
  cleanedContent = cleanedContent.replace(/\\/g, '');

  
  return cleanedContent;
};


const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ initialContent, imageUrl, id, onContentChange, onSave, onImageClick }, ref) => {
    const [content, setContent] = useState(() => cleanHtmlContent(initialContent));
    const isResizingRef = useRef(false);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(!initialContent);

    useEffect(() => {
      if (initialContent) {
        // Clean the content before setting it
        setContent(cleanHtmlContent(initialContent));
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(true);
      }
    }, [initialContent]);


    useEffect(() => {
      if (imageUrl && ref && 'current' in ref && ref.current) {
        const editor = ref.current.getEditor();
        const range = editor.getSelection();
        const index = range ? range.index : editor.getLength();
        editor.insertEmbed(index, 'image', imageUrl);
        editor.setSelection(index + 1);
      }
    }, [imageUrl, ref]);


    // Track resize operations
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        // Check if clicking on a resize handle
        const target = e.target as HTMLElement;
        if (target.classList.contains('blot-formatter__resize-handle')) {
          isResizingRef.current = true;
        } else if (target.tagName === 'IMG') {
          const imgSrc = (target as HTMLImageElement).src;
          setSelectedImage(imgSrc);
        } else {
          // If clicking on anything else except edit buttons, clear selection
          const isEditButton = target.closest('button') && 
            (target.closest('button')?.title?.includes('Edit') || 
             target.closest('button')?.innerHTML?.includes('Edit'));
          
          if (!isEditButton) {
            setSelectedImage(null);
          }
        }
      };

      const handleMouseUp = () => {
        if (isResizingRef.current) {
          // Add a slight delay before allowing clicks again
          setTimeout(() => {
            isResizingRef.current = false;
          }, 100);
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    const handleChange = (value: string) => {
      // Clean the content when it changes
      const cleanedContent = cleanHtmlContent(value);
      setContent(cleanedContent);
      onContentChange(cleanedContent);
    };

    // Enhanced Quill configuration to handle lists better
    const modules = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: ['', 'center', 'right', 'justify'] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
      blotFormatter2: {
        align: {
          allowAligning: false,
        },
        image: {
          allowAltTitleEdit: false
        },
        resize: {
          allowResizing: true,
          styles: {
            handle: {
              backgroundColor: '#650AAA',
              border: '1px solid white'
            },
            overlay: {
              border: '1px dashed #650AAA'
            }
          }
        },
      }, 
      clipboard: {
        // Toggle matchVisual to false to prevent Quill from adding extra elements when pasting
        matchVisual: false
      },
      // keyboard: {
      //   // Customize how lists work with keyboard interaction
      //   bindings: {
      //     // Override the default "list" behavior
      //     list: {
      //       key: 'backspace',
      //       format: ['list'],
      //       handler: function(range: any, context: any) {
      //         // Custom handling here if needed
      //         return true; // Let Quill handle it by default
      //       }
      //     }
      //   }
      // }
    };

    // Render the placeholder when no content is selected
    if (showPlaceholder) {
      return (
        <div className="flex flex-col mx-auto w-full h-full">
          <EditorStyles />
          
          {/* Empty state placeholder */}
          <div className="border rounded-lg h-[calc(100vh-240px)] flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <div className="bg-white rounded-full p-4 shadow-md mb-6">
              <FileText className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Chapter Selected</h3>
            <p className="text-gray-600 max-w-md mb-6">
              Please select a chapter from the side panel to start editing its content.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col mx-auto w-full">
        <EditorStyles />
        
        {/* Top toolbar area */}
        <div className="flex justify-between items-center mb-3">
          <EditorToolbar editorRef={ref as React.RefObject<ReactQuill>} />
        </div>
        
        {/* Image edit button - now more accessible and better positioned */}
        {selectedImage && (
          <div className="flex items-center justify-start mb-3">
            <Button
              onClick={() => {
                onImageClick && selectedImage && onImageClick(selectedImage);
              }}
              className={`bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-3 py-1.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg`}
              title="Edit the selected image"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm">Edit Image</span>
            </Button>
          </div>
        )}
        
        {/* Editor area - with improved overflow handling */}
        <div className="editor-wrapper relative border rounded-lg overflow-hidden" ref={editorRef}>
          <ReactQuill
            ref={ref}
            value={content}
            onChange={handleChange}
            modules={modules}
            theme="snow"
            preserveWhitespace
          />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;