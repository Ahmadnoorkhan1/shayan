import  { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles

const TextEditor = () => {
  const [value, setValue] = useState("");

  return (
    <div>
      <ReactQuill theme="snow" value={value} onChange={setValue} />
      <p>Output:</p>
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
};

export default TextEditor;



