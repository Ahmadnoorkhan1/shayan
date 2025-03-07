import React, { useState, useEffect, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';

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

    useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        const editor = ref.current.getEditor();
        
        const handleImageClick = (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'IMG') {
            const imageUrl = target.getAttribute('src');
            if (imageUrl && onImageClick) {
              onImageClick(imageUrl);
            }
          }
        };

        editor.root.addEventListener('click', handleImageClick);
        return () => {
          editor.root.removeEventListener('click', handleImageClick);
        };
      }
    }, [ref, onImageClick]);

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
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
    };

    return (
      <div className="flex flex-col mx-auto gap-4 mt-8 w-full">
        <style>
          {`
            .editor-wrapper {
              display: flex;
              flex-direction: column;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              transition: box-shadow 0.3s ease;
            }
            .editor-wrapper:hover {
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .editor-wrapper .ql-toolbar {
              position: sticky;
              top: 0;
              z-index: 1;
              background: white;
              border: 1px solid #e5e7eb;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              padding: 12px;
            }
            .editor-wrapper .ql-container {
              flex: 1;
              min-height: 200px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-bottom-left-radius: 8px;
              border-bottom-right-radius: 8px;
            }
            .ql-editor {
              min-height: 200px;
              padding: 24px;
              font-size: 16px;
              line-height: 1.75;
              color: #374151;
            }
            .ql-editor h1 {
              font-size: 2em;
              font-weight: 700;
              color: #111827;
              margin-bottom: 1rem;
            }
            .ql-editor h2 {
              font-size: 1.5em;
              font-weight: 600;
              color: #1f2937;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            .ql-editor p {
              margin-bottom: 1rem;
              line-height: 1.75;
            }
            .ql-editor ul, .ql-editor ol {
              padding-left: 1.5rem;
              margin-bottom: 1rem;
            }
            .ql-editor li {
              margin-bottom: 0.5rem;
            }
            .ql-editor img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1.5rem 0;
              border-radius: 4px;
            }
            .ql-editor blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1rem;
              margin: 1.5rem 0;
              color: #4b5563;
            }
            .ql-editor code {
              background-color: #f3f4f6;
              padding: 0.2em 0.4em;
              border-radius: 4px;
              font-family: monospace;
            }
            .ql-snow .ql-toolbar button:hover,
            .ql-snow .ql-toolbar button:focus {
              color: #6366f1;
            }
            .ql-snow .ql-toolbar button.ql-active {
              color: #4f46e5;
            }
          `}
        </style>
        <div className="editor-wrapper">
          <ReactQuill
            ref={ref}
            value={content}
            onChange={handleChange}
            modules={modules}
            theme="snow"
            preserveWhitespace
          />
        </div>

        <button 
          onClick={onSave} 
          className="btn-primary self-end text-white px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Save Content
        </button>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;