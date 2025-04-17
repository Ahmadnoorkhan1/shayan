import { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";

interface SummaryStepProps {
  summary: string;
  onUpdate: (updatedSummary: string) => void;
}

interface SummarySection {
  title: string;
  content: string;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ summary, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<string>("");
  const [sections, setSections] = useState<SummarySection[]>([]);

  useEffect(() => {
    if (summary) {
      try {
        // Clean the HTML string
        const cleanHtml = summary.replace(/```html|```/g, '').trim();
        setParsedSummary(cleanHtml);
        
        // Extract sections from HTML (simple approach)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanHtml;
        
        const sectionElements = tempDiv.querySelectorAll('.summary-section');
        const extractedSections: SummarySection[] = [];
        
        sectionElements.forEach(section => {
          const titleEl = section.querySelector('h2');
          const title = titleEl ? titleEl.textContent || '' : '';
          
          // Get all content except the h2
          let content = '';
          section.childNodes.forEach((node:any) => {
            if (node.nodeName !== 'H2') {
              content += node.outerHTML || '';
            }
          });
          
          extractedSections.push({ title, content });
        });
        
        setSections(extractedSections.length > 0 ? extractedSections : [
          { title: 'Introduction', content: '<p>Add your introduction here.</p>' },
          { title: 'Main Content', content: '<p>Describe your main content here.</p>' },
          { title: 'Conclusion', content: '<p>Add your conclusion here.</p>' }
        ]);
      } catch (error) {
        console.error("Error parsing summary HTML:", error);
      }
    }
  }, [summary]);

  const handleSectionUpdate = (index: number, field: keyof SummarySection, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleSave = () => {
    // Rebuild the HTML from our sections
    const updatedHtml = `
    <div class="summary-container">
      ${sections.map(section => `
        <div class="summary-section">
          <h2>${section.title}</h2>
          ${section.content}
        </div>
      `).join('')}
    </div>`;
    
    onUpdate(updatedHtml);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No summary available. Please go back and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with edit button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800"></h3>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-tl from-purple-600 to-purple-700 rounded-md shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Summary
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md transition-colors hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm transition-colors hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Summary content */}
      {isEditing ? (
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Section Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  value={section.title}
                  onChange={(e) => handleSectionUpdate(index, 'title', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Section Content</label>
                <textarea
                  rows={5}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  value={section.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}
                  onChange={(e) => {
                    // Wrap content in paragraph tags for simple formatting
                    const formattedContent = `<p>${e.target.value.replace(/\n\n/g, '</p><p>')}</p>`;
                    handleSectionUpdate(index, 'content', formattedContent);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter plain text content. Use double line breaks to create new paragraphs.
                </p>
              </div>
            </div>
          ))}
          
         
        </div>
      ) : (
        <div className="bg-white  overflow-hidden">
          <div 
            className="prose prose-purple max-w-none p-6 summary-content"
            dangerouslySetInnerHTML={{ __html: parsedSummary }}
          />
        </div>
      )}

      {/* Styling for the summary content */}
      <style >{`
        .summary-content .summary-section {
          margin-bottom: 1.5rem;
        }
        .summary-content h2 {
          color: #6b46c1;
          font-size: 1.25rem;
          margin-top: 0;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .summary-content p, .summary-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .summary-content ul, .summary-content ol {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default SummaryStep;