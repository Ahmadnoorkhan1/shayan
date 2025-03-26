import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save, Edit, Image } from 'lucide-react';

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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

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
      setContent(value);
      onContentChange(value);
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
        align: {
          allowAligning: true,
          alignments: ['left', 'center', 'right']
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
      }
    };

    return (
      <div className="flex flex-col mx-auto gap-4 -mt-8 w-full">
        <EditorStyles />
        
  {/* Top toolbar area */}
  <div className="flex justify-between items-center">
    <EditorToolbar editorRef={ref as React.RefObject<ReactQuill>} />
  </div>
  
  {/* Image edit button - reserve space with visibility hidden instead of conditional rendering */}
  <div className="flex items-center justify-start "> {/* Fixed height to prevent layout shifts */}
    <Button
      onClick={() => {
        onImageClick && selectedImage && onImageClick(selectedImage);
      }}
      className={`bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg ${selectedImage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      title="Edit the selected image"
    >
      <Edit className="h-4 w-4" />
      <span>Edit Image</span>
    </Button>
  </div>
        
        {/* Editor area */}
        <div className="editor-wrapper relative" ref={editorRef}>
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