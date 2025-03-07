// ChapterGallery.tsx
import React, { useState } from "react";
import { Book, ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react';

interface ChapterGalleryProps {
  chapters: string[];
  onSelectChapter: (chapter: string, index: number) => void;
  // onSelectSection: (section: string) => void;
}

const ChapterGallery: React.FC<ChapterGalleryProps> = ({ chapters, onSelectChapter }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<{chapter: number, section: number} | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);


  // console.log(chapters, "chapters");

  const parseChapter = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if this is a cover chapter
    const isCover = html.includes('data-cover="true"') || 
                    html.includes('book-cover-image');
    
    // Get chapter title (h1)
    const titleElement = doc.querySelector('h1');
    const title = isCover ? 'Course Cover' : 
                  (titleElement ? titleElement.textContent || 'Untitled' : 'Untitled');
    
    // Get sections (h2)
    const sectionElements = doc.querySelectorAll('h2');
    const sections = Array.from(sectionElements).map(section => {
      const sectionTitle = section.textContent || 'Untitled Section';
      
      // Get content between this h2 and the next h2 or end of document
      let content = '';
      let currentNode = section.nextElementSibling;
      while (currentNode && currentNode.tagName !== 'H2') {
        content += currentNode.outerHTML;
        currentNode = currentNode.nextElementSibling;
      }
      
      return { title: sectionTitle, content };
    });
  
    // Get editable content (everything except h1)
    let editableContent = '';
    let currentNode = titleElement?.nextElementSibling;
    while (currentNode) {
      editableContent += currentNode.outerHTML;
      currentNode = currentNode.nextElementSibling;
    }
  
    const description = isCover ? 'Course cover image' : 
      (sections.length > 0 ? 
        `${sections.length} ${sections.length === 1 ? 'section' : 'sections'} available` : 
        "No sections found");
  
    return { title, description, sections, editableContent };
  };
  
  
  
  const handleChapterClick = (chapter: string, index: number) => {
    onSelectChapter(chapter, index);
    setSelectedChapterIndex(index);

  };

  const handleExpandClick = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  

  return (
    <div style={{ scrollbarWidth: "none", msOverflowStyle: "none"}} className="w-full sm:w-[40%] h-[calc(100vh-4rem)] flex flex-col bg-white rounded-lg shadow-lg">
      <div className=" top-0 bg-white z-20 px-4 py-3 border-b border-purple-100">
        <h3 className="text-lg font-semibold text-purple-800 flex items-center">
          <Book className="w-5 h-5 mr-2 text-purple-600" />
          Course Chapters
        </h3>
      </div>

      <div style={{ scrollbarWidth: "none", msOverflowStyle: "none"}} className="flex-1 overflow-y-auto chapter-scroll-container p-4 space-y-3">
        {chapters?.length > 0 ? (
          <div className="space-y-4">
            {chapters?.map((chapter, index) => {
              const { title, description, sections } = parseChapter(chapter);
              const isHovered = hoveredIndex === index;
              const isExpanded = expandedChapter === index;

              return (
                <div key={index} className="group">
  <div
    onClick={() => handleChapterClick(chapter, index)}
    onMouseEnter={() => setHoveredIndex(index)}
    onMouseLeave={() => setHoveredIndex(null)}
    className={`
      cursor-pointer p-3 bg-white rounded-lg
      hover:bg-purple-50/50 transition-all duration-300 ease-in-out
      border border-purple-100 hover:border-purple-300
      transform hover:-translate-y-0.5
      ${isExpanded ? 'shadow-md bg-purple-50/30' : 'hover:shadow-lg'}
      ${selectedChapterIndex === index ? 
        'border-purple-500 shadow-lg bg-purple-50 scale-[1.02]' : 
        'hover:scale-[1.01]'}
      relative
      before:absolute before:inset-0 
      before:rounded-lg before:transition-all before:duration-300
      ${selectedChapterIndex === index ?
        'before:bg-purple-100/10 before:border-2 before:border-purple-500/30' :
        'before:border before:border-transparent before:hover:border-purple-200/50'}
    `}
  >
    <div className="flex justify-between items-start gap-3 relative z-10">
      <div className="flex items-start gap-2 min-w-0">
        <FileText 
          className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors duration-200
            ${isHovered ? 'text-purple-600' : 'text-purple-400'}
            ${selectedChapterIndex === index ? 'text-purple-700' : ''}
          `}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium truncate transition-colors duration-200
            ${selectedChapterIndex === index ? 'text-purple-900' : 'text-gray-800'}
          `}>
            {title}
          </h4>
          <p className={`text-xs mt-1 transition-colors duration-200
            ${selectedChapterIndex === index ? 'text-purple-600' : 'text-gray-500'}
          `}>
            {description}
          </p>
        </div>
      </div>
      <div className={`transition-opacity duration-200
        ${isHovered || selectedChapterIndex === index ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {index + 1}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
              );
            })}

            
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No chapters available</p>
          </div>
        )}
      </div>
    </div>

    
  );
};

export default ChapterGallery;