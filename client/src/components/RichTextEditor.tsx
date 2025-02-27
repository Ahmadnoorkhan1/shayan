import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiService from '../utilities/service/api'; // Import your API service
import { Button } from './ui/button';

interface RichTextEditorProps {
  initialContent: string;
  imageUrl?: string | null;
  id: string | number;
  onContentChange: (content: string) => void;
  onSave: () => void;
}


const RichTextEditor = ({ initialContent, imageUrl , id, onContentChange, onSave }: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const quillRef = useRef<ReactQuill>(null);

  // Handle initial content
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Handle dynamic image insertion
  useEffect(() => {
    if (imageUrl && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      const index = range ? range.index : editor.getLength();
      editor.insertEmbed(index, 'image', imageUrl);
      editor.setSelection(index + 1);
      editor.insertText(index + 1, '\n'); // Add a new line after the image
    }
  }, [imageUrl]);

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
            ref={quillRef}
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
};

export default RichTextEditor;