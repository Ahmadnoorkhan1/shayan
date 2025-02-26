import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  initialContent: string;
  imageUrl?: string | null;
}

const RichTextEditor = ({ initialContent, imageUrl }: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const quillRef = useRef<ReactQuill>(null);
  // const prevImageUrlRef = useRef<string | null>(null);

  console.log(imageUrl, "Content");

  // Handle initial content
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  

  const handleChange = (value: string) => {
    setContent(value);
  };

  // Existing image handler for manual uploads
  // function imageHandler() {
  //   if (!quillRef.current) return;

  //   const editor = quillRef.current.getEditor();
  //   const range = editor.getSelection();
  //   const value = prompt(imageUrl as any);

  //   if (value && range) {
  //     editor.insertEmbed(range.index, "image", value, "user");
  //     editor.setSelection(range.index + 1, 0);
  //   }
  // }

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
        ['link', 'video', 'code-block'],
        ['clean'],
        // ['image'],
      ],
      // handlers: {
      //   image: imageHandler,
      // },
    },
  
  };

  return (
    <div className="flex gap-6">
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
    </div>
  );
};

export default RichTextEditor;


