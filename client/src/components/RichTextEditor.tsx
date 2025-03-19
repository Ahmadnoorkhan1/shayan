import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save } from 'lucide-react'; // Import Save icon

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

const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ initialContent, imageUrl, id, onContentChange, onSave, onImageClick }, ref) => {
    const [content, setContent] = useState(initialContent);
    const isResizingRef = useRef(false);
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (initialContent) {
        setContent(initialContent);
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

    // Setup image double-click handler for editing
    useEffect(() => {
      // Function to add event listeners to all images
      const addImageListeners = () => {
        // If no editor or no onImageClick handler, skip
        if (!ref || !('current' in ref) || !ref.current || !onImageClick) return;
        
        // Get the editor element
        const editor = ref.current.getEditor();
        const editorEl = editor.root;
        
        // Find all images in the editor
        const images = editorEl.querySelectorAll('img');
        
        // Add double-click handlers to each image
        images.forEach(img => {
          // Remove existing listeners first to avoid duplicates
          img.removeEventListener('dblclick', handleImageDblClick);
          
          // Add the double-click handler
          img.addEventListener('dblclick', handleImageDblClick);
          
          // Mark the image as having a listener
          img.setAttribute('data-has-listener', 'true');
        });
      };

      // Handler for double-clicks
      const handleImageDblClick = (event: Event) => {
        // Only process if we're not currently resizing
        // if (isResizingRef.current) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const imgEl = event.target as HTMLImageElement;
        const imageUrl = imgEl.getAttribute('src');
        
        if (imageUrl && onImageClick) {
          console.log('Double click detected on image:', imageUrl);
          onImageClick(imageUrl);
        }
      };
      
      // Call function to add listeners initially
      addImageListeners();
      
      // Set up a mutation observer to watch for new images
      if (ref && 'current' in ref && ref.current) {
        const editor = ref.current.getEditor();
        const editorEl = editor.root;
        
        // Create a mutation observer
        const observer = new MutationObserver((mutations) => {
          // Check if any images were added
          let shouldAddListeners = false;
          
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                // Check direct node
                if (node.nodeName === 'IMG') {
                  shouldAddListeners = true;
                }
                
                // Check children of added nodes
                if (node.nodeType === 1) {
                  const el = node as Element;
                  if (el.querySelector('img')) {
                    shouldAddListeners = true;
                  }
                }
              });
            }
          });
          
          // If images were added, update listeners
          if (shouldAddListeners) {
            addImageListeners();
          }
        });
        
        // Start observing
        observer.observe(editorEl, { 
          childList: true, 
          subtree: true 
        });
        
        // Cleanup
        return () => {
          observer.disconnect();
          const images = editorEl.querySelectorAll('img');
          images.forEach(img => {
            img.removeEventListener('dblclick', handleImageDblClick);
          });
        };
      }
    }, [ref, onImageClick]);

    // Track resize operations
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        // Check if clicking on a resize handle
        const target = e.target as HTMLElement;
        if (target.classList.contains('blot-formatter__resize-handle')) {
          isResizingRef.current = true;
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
      setContent(value);
      onContentChange(value);
    };

    const handleSaveClick = () => {
      onSave();
    };

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
        // align: {
        //   allowAligning: true,
        //   alignments: ['left', 'center', 'right']
        // },
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
        // delete: {
        //   allowKeyboardDelete: true,
        // },
        // image: {
        //   allowAltTitleEdit: true,
        //   allowCompressor: true,
        //   compressionOptions: {
        //     maxWidth: 1000,
        //     maxHeight: 1000,
        //     quality: 0.8
        //   }
        // }
      }
    };

    return (
      <div className="flex flex-col mx-auto gap-4 mt-8 w-full">
        <EditorStyles />
        
        {/* Top save button */}
        <div className="flex justify-between items-center mb-4">
          <EditorToolbar editorRef={ref as React.RefObject<ReactQuill>} />
       
        </div>
        
        <div className="editor-wrapper" ref={editorRef}>
          <ReactQuill
            ref={ref}
            value={content}
            onChange={handleChange}
            modules={modules}
            theme="snow"
            preserveWhitespace
          />
        </div>

        {/* Bottom save button - more prominent */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSaveClick} 
            className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                      shadow-lg hover:shadow-xl
                      transform transition-all duration-200 hover:-translate-y-0.5 text-base"
          >
            <Save className="w-6 h-6" />
            Save Content
          </Button>
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;