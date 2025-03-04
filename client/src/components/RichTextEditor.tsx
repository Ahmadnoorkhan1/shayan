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

    // Handle initial content
    useEffect(() => {
      if (initialContent) {
        setContent(initialContent);
      }
    }, [initialContent]);

    // Handle dynamic image insertion
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
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ script: 'sub' }, { script: 'super' }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'video', 'image', 'code-block'],
          ['clean'],
        ],
      },
    };

    return (
      <div className="flex flex-col gap-6">
        <style>
          {`
            .editor-wrapper {
              display: flex;
              flex-direction: column;
            }
            .editor-wrapper .ql-toolbar {
              position: sticky;
              top: 0;
              z-index: 1;
              background: white;
              border: 1px solid #ccc;
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
            }
            .editor-wrapper .ql-container {
              flex: 1;
              min-height: 200px;
              border: 1px solid #ccc;
              border-top: none;
              border-bottom-left-radius: 4px;
              border-bottom-right-radius: 4px;
            }
            .ql-editor {
              min-height: 200px;
              color: black;
            }
            .ql-editor img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1em 0;
            }
          `}
        </style>
        <div className="flex-1">
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
        </div>
        <Button
          onClick={onSave}
          color="primary"
          className="self-end text-white"
        >
          Save Content
        </Button>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;