import React, { useState, useEffect } from 'react';
import { Save, X, ChevronDown, ChevronUp , Edit} from 'lucide-react';

interface SummaryDisplayProps {
  title: string;
  content: string;
  onSave?: (updatedContent: string) => void;
  type?: 'book' | 'course' | 'article' | 'general';
  alertMessage?: string;
  editable?: boolean;
  localStorageKey?: string;
}

interface SummarySection {
  title: string;
  content: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  title,
  content,
  onSave,
  type = 'course',
  alertMessage = 'Review your summary below. This overview will help guide the content generation process.',
  editable = true,
  localStorageKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState<SummarySection[]>([]);
  const [displayContent, setDisplayContent] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  // Process HTML content for display
  const processContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    // Handle different content formats
    let processedContent = rawContent;
    
    // Clean up any special characters
    return processedContent
      .replace(/\\"/g, '"')
      .replace(/^"|"$/g, '');
  };

  // Parse HTML content into sections
  const parseContentIntoSections = (htmlContent: string): SummarySection[] => {
    try {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Find all section titles (h3 elements)
      const h3Elements = tempDiv.querySelectorAll('h3.summary-section-title');
      const parsedSections: SummarySection[] = [];
      
      h3Elements.forEach((h3, index) => {
        const sectionTitle = h3.textContent || `Section ${index + 1}`;
        let sectionContent = '';
        
        // Get all elements until the next h3 or the end
        let nextElement = h3.nextElementSibling;
        while (nextElement && !nextElement.matches('h3.summary-section-title')) {
          if (nextElement.tagName === 'P') {
            sectionContent += nextElement.textContent + '\n\n';
          }
          nextElement = nextElement.nextElementSibling;
        }
        
        parsedSections.push({
          title: sectionTitle,
          content: sectionContent.trim()
        });
      });
      
      // If no sections were found, create a default one
      if (parsedSections.length === 0) {
        parsedSections.push({
          title: 'Summary',
          content: tempDiv.textContent || ''
        });
      }
      
      return parsedSections;
    } catch (error) {
      console.error("Error parsing content:", error);
      return [{ title: 'Summary', content: htmlContent }];
    }
  };

  // Convert sections back to HTML
  const sectionsToHtml = (sections: SummarySection[]): string => {
    return `<div class="course-summary">
      ${sections.map(section => `
        <h3 class="summary-section-title">${section.title}</h3>
        ${section.content.split('\n\n').map(paragraph => 
          paragraph.trim() ? `<p>${paragraph}</p>` : ''
        ).join('')}
      `).join('')}
    </div>`;
  };

  useEffect(() => {
    // Initialize the display content
    const processed = processContent(content);
    setDisplayContent(processed);
    
    // Parse content into sections
    if (processed) {
      setSections(parseContentIntoSections(processed));
    }
  }, [content]);

  const handleEditClick = () => {
    setIsEditing(true);
    setExpandedSection(0); // Expand the first section by default
  };

  const handleSaveClick = () => {
    // Convert sections back to HTML
    const updatedContent = sectionsToHtml(sections);
    
    // Save to localStorage if a key is provided
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, updatedContent);
    }
    
    // Update the display content
    setDisplayContent(updatedContent);
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(updatedContent);
    }
    
    setIsEditing(false);
    setExpandedSection(null);
  };

  const handleCancelClick = () => {
    // Reset to original sections
    setSections(parseContentIntoSections(displayContent));
    setIsEditing(false);
    setExpandedSection(null);
  };

  const updateSectionTitle = (index: number, newTitle: string) => {
    const updatedSections = [...sections];
    updatedSections[index].title = newTitle;
    setSections(updatedSections);
  };

  const updateSectionContent = (index: number, newContent: string) => {
    const updatedSections = [...sections];
    updatedSections[index].content = newContent;
    setSections(updatedSections);
  };

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  // Loading state when content is empty
  if (!content && !displayContent) {
    return (
      <div className="w-full max-w-5xl mx-auto overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary pb-2 border-b-2 border-gray-200 inline-block">
            {title}
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 flex justify-center items-center h-60">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-2.5"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-64 mb-2.5"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-40"></div>
            </div>
            <p className="text-gray-500 italic">Summary is being generated...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto overflow-hidden">
    {/* Header */}
    <div className="mb-8 flex justify-between items-end">
      <h2 className="text-3xl font-semibold text-primary tracking-tight border-b border-gray-200 pb-2">
        {title}
      </h2>
      {editable && !isEditing && (
        <button
          onClick={handleEditClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-tl rounded-md shadow-sm transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Summary 
        </button>
      )}
    </div>
  
    {/* Alert */}
    {alertMessage && !isEditing && (
      <div className="mt-4 p-4 bg-gray-100 border-l-4 border-gray-400 rounded-md">
        <p className="text-sm text-gray-700">{alertMessage}</p>
      </div>
    )}
  
    {/* Content */}
    {isEditing ? (
      <div className="bg-white rounded-xl shadow p-6 md:p-8">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          Edit each section of your summary. Click on a section to expand and edit.
        </div>
  
        <div className="space-y-6">
  {sections?.map((section, index) => (
    <div
      key={index}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all hover:shadow-sm"
    >
      <button
        onClick={() => toggleSection(index)}
        className={`w-full flex justify-between items-center px-5 py-4 text-left font-semibold ${
          expandedSection === index ? 'bg-gray-50' : 'bg-white'
        } transition-colors`}
      >
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateSectionTitle(index, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-grow text-gray-900 text-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 px-2 py-1 rounded-md transition-all placeholder:text-gray-400"
        />
        {expandedSection === index ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expandedSection === index && (
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Content
          </label>
          <textarea
            value={section.content}
            onChange={(e) => updateSectionContent(index, e.target.value)}
            className="w-full min-h-[180px] p-3 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none"
            placeholder="Enter content here..."
          />
        </div>
      )}
    </div>
  ))}
</div>

  
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            <Save className="w-4 h-4 inline mr-1" />
            Save Changes
          </button>
        </div>
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow p-6 md:p-8">
        <div 
          className="prose prose-lg max-w-none summary-content text-gray-800"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </div>
    )}
  
    {/* Enhanced Global Styles */}
    <style>{`
      .summary-content h3.summary-section-title {
        color: #2563eb;
        font-size: 1.375rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
        font-weight: 600;
      }
  
      .summary-content p {
        margin-bottom: 1rem;
        line-height: 1.75;
      }
  
      .course-summary > p:first-of-type {
        font-size: 1.1rem;
        font-weight: 500;
      }
  
      textarea:focus, input:focus {
        outline: none;
      }
    `}</style>
  </div>
  
  );
};

export default SummaryDisplay;