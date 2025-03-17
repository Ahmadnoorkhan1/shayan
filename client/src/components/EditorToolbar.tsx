import { useEffect } from 'react';
import ReactQuill from 'react-quill';

interface EditorToolbarProps {
  editorRef: React.RefObject<ReactQuill>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editorRef }) => {
  // Add tooltips to buttons after Quill initializes
  useEffect(() => {
    if (editorRef && 'current' in editorRef && editorRef.current) {
      // Define the tooltip data with button selector and tooltip text
      const tooltips = [
        { selector: 'button.ql-bold', text: 'Bold (Ctrl+B)' },
        { selector: 'button.ql-italic', text: 'Italic (Ctrl+I)' },
        { selector: 'button.ql-underline', text: 'Underline (Ctrl+U)' },
        { selector: 'button.ql-strike', text: 'Strikethrough' },
        { selector: 'button.ql-blockquote', text: 'Block Quote' },
        { selector: 'button.ql-list[value="ordered"]', text: 'Numbered List' },
        { selector: 'button.ql-list[value="bullet"]', text: 'Bullet List' },
        { selector: 'button.ql-indent[value="-1"]', text: 'Decrease Indent' },
        { selector: 'button.ql-indent[value="+1"]', text: 'Increase Indent' },
        { selector: 'button.ql-link', text: 'Insert Link' },
        { selector: 'button.ql-image', text: 'Insert Image' },
        { selector: 'button.ql-video', text: 'Insert Video' },
        { selector: 'button.ql-clean', text: 'Clear Formatting' },
      ];
      
      // Add data-tooltip attribute to all buttons
      setTimeout(() => {
        tooltips.forEach(({ selector, text }) => {
          const button = document.querySelector(selector);
          if (button) {
            button.setAttribute('data-tooltip', text);
            button.setAttribute('aria-label', text);
          }
        });
        
        // Add tooltip attributes to header dropdown
        const headerDropdown = document.querySelector('.ql-header .ql-picker-label');
        if (headerDropdown) {
          headerDropdown.setAttribute('data-tooltip', 'Text Style');
          headerDropdown.setAttribute('aria-label', 'Text Style');
        }
        
        // Add tooltip attributes to alignment dropdown
        const alignDropdown = document.querySelector('.ql-align .ql-picker-label');
        if (alignDropdown) {
          alignDropdown.setAttribute('data-tooltip', 'Text Alignment');
          alignDropdown.setAttribute('aria-label', 'Text Alignment');
        }
        
        // Add tooltip attributes to color pickers
        const colorPicker = document.querySelector('.ql-color .ql-picker-label');
        if (colorPicker) {
          colorPicker.setAttribute('data-tooltip', 'Text Color');
          colorPicker.setAttribute('aria-label', 'Text Color');
        }
        
        const bgColorPicker = document.querySelector('.ql-background .ql-picker-label');
        if (bgColorPicker) {
          bgColorPicker.setAttribute('data-tooltip', 'Background Color');
          bgColorPicker.setAttribute('aria-label', 'Background Color');
        }
      }, 100);
    }
  }, [editorRef]);

  return null; // This component doesn't render anything visible
};

export default EditorToolbar;