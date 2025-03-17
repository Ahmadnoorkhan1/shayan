import React from 'react';

const EditorStyles: React.FC = () => {
  return (
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
      /* Increase button size */
      .ql-toolbar.ql-snow .ql-formats {
        margin-right: 15px;
      }
      .ql-toolbar.ql-snow button {
        width: 36px;
        height: 36px;
        padding: 4px;
        margin: 0 3px;
        position: relative;
        transition: all 0.2s ease;
      }
      .ql-toolbar.ql-snow button:hover {
        background-color: #f3f4f6;
        border-radius: 4px;
      }
      .ql-toolbar.ql-snow button svg {
        width: 22px;
        height: 22px;
      }
      /* Make dropdowns bigger */
      .ql-toolbar.ql-snow .ql-picker {
        font-size: 16px;
        height: 36px;
      }
      .ql-toolbar.ql-snow .ql-picker-label {
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      .ql-toolbar.ql-snow .ql-picker-label:hover {
        background-color: #f3f4f6;
      }
      /* Increase icons in dropdowns */
      .ql-toolbar.ql-snow .ql-picker-options .ql-picker-item {
        padding: 6px 8px;
      }
      /* Tooltip styling */
      .ql-toolbar.ql-snow button[data-tooltip],
      .ql-toolbar.ql-snow .ql-picker-label[data-tooltip] {
        position: relative;
      }
      .ql-toolbar.ql-snow button[data-tooltip]:hover::after,
      .ql-toolbar.ql-snow .ql-picker-label[data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        top: calc(100% + 5px);
        left: 50%;
        transform: translateX(-50%);
        background-color: #374151;
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10;
        pointer-events: none;
        opacity: 0;
        animation: tooltipFadeIn 0.2s ease forwards;
      }
      .ql-toolbar.ql-snow button[data-tooltip]:hover::before,
      .ql-toolbar.ql-snow .ql-picker-label[data-tooltip]:hover::before {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-bottom-color: #374151;
        z-index: 10;
        pointer-events: none;
        opacity: 0;
        animation: tooltipFadeIn 0.2s ease forwards;
      }
      @keyframes tooltipFadeIn {
        to {
          opacity: 1;
        }
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
        background-color: #f3f4f6;
        border-radius: 4px;
      }
      /* Improved save button */
      .save-button {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-size: 1rem;
        padding: 0.75rem 1.5rem;
      }
      .save-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
         .ql-tooltip.ql-editing[data-mode="video"] {
        position: fixed !important;
        left: 35% !important; /* Center horizontally */
        top: 50% !important; /* Position higher in the viewport */
        transform: translateX(-50%) !important;
        margin-left: 0 !important;
        width: 350px !important;
        z-index: 9999 !important;
        background: white !important;
        border: 1px solid #ddd !important;
        border-radius: 6px !important;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
        padding: 10px !important;
      }
      
      /* Style the input field */
      .ql-tooltip.ql-editing[data-mode="video"] input[type="text"] {
        width: 200px !important;
        padding: 8px !important;
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        margin-bottom: 8px !important;
      }
      
     
      
     
      `}
    </style>
  );
};

export default EditorStyles;