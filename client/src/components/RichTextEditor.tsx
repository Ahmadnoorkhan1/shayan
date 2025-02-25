import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ initialContent }: any) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (value: any) => {
    setContent(value);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video', 'code-block'],
      ['clean'],
    ],
  };

  return (
    <div className="editor-wrapper">
      <style>
        {`
          .editor-wrapper {
            display: flex;
            flex-direction: column;
            // height: 90vh;
          }
          .editor-wrapper .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 1;
            background: white;
            // border-top: none;
          }
          .editor-wrapper .ql-container {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
          }
          .ql-editor {
            color: black;
            // min-height: 90vh;
          }
          .ql-container::-webkit-scrollbar {
            width: 6px;
          }
          .ql-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .ql-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }
          .ql-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
      <ReactQuill 
        value={content} 
        onChange={handleChange} 
        modules={modules} 
        theme="snow" 
      />
    </div>
  );
};

export default RichTextEditor;

