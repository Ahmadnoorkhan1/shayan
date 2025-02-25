import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ initialContent }: any) => {
  const [content, setContent] = useState(initialContent);

  // Sync content with initialContent when it changes
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
    <div
      className="editor-container max-h-[90vh] overflow-y-auto p-4 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
      style={{
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
    >
      <style>
        {`
          .editor-container::-webkit-scrollbar {
            display: none;
          }
          /* Force editor text to be black */
          .ql-editor {
            color: black;
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

