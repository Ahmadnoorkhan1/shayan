// ChapterGallery.tsx
import React, { useState } from "react";
import { Book, ChevronDown, ChevronUp, FileText, BookOpen, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import Tooltip from "../../../components/ui/tooltip";

interface ChapterGalleryProps {
  chapters: any[];
  onSelectChapter: (chapter: string, index: number) => void;
  onDeleteChapter?: (index: number) => void;
  isVisible: boolean; // New prop to control visibility
  onToggleVisibility: () => void; // Function to toggle visibility
}

const ChapterGallery: React.FC<ChapterGalleryProps> = ({ 
  chapters, 
  onSelectChapter,
  onDeleteChapter,
  isVisible,
  onToggleVisibility
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  // const [selectedSection, setSelectedSection] = useState<{chapter: number, section: number} | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);

  // Existing parseChapter function remains unchanged
  const parseChapter = (html: any) => {


    if (typeof(html) === 'object'){
      html = html.content;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if this is a cover chapter
    const isCover = typeof html === 'string' && (
      html.includes('data-cover="true"') || 
      html.includes('book-cover-image')
    );
    
    // Extract chapter title properly
    let title = 'Untitled Chapter';
    
    if (isCover) {
      title = 'Course Cover';
    } else {
      // Try to find title from h1 element first
      const h1Element = doc.querySelector('h1');
      console.log(h1Element, "see title")
      if (h1Element && h1Element.textContent) {
        title = h1Element.textContent.trim();
      } 
      // If no h1 found, try to get title from object property if available
      else if (typeof html === 'object' && html !== null && html.title) {
        title = html.title;
      }
      // Last resort: Try to extract title from first few characters
      else if (typeof html === 'string' && html.length > 0) {
        // Look for a title pattern in the HTML string
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch && titleMatch[1]) {
          // Clean up any HTML tags inside the h1
          title = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
        }
      }
    }
    
    // Get sections (h2)
    const sectionElements = doc.querySelectorAll('h2');
    const sections = Array.from(sectionElements).map(section => {
      // Clean up section title to remove number prefixes like "2.2", "3.3"
      let sectionTitle = section.textContent || 'Untitled Section';
      
      // Remove duplicate number patterns like "2.2", "3.3", etc.
      sectionTitle = sectionTitle.replace(/^(\d+)\.(\1)/, '$1.$2');
      
      // If there's a number followed by the same number (e.g. "2 2"), fix it
      sectionTitle = sectionTitle.replace(/^(\d+)\s+\1/, '$1');

      // For non-covered case, also handle when title has <chapter>.<section> format
      if (!isCover && title) {
        const chapterMatch = title.match(/^Chapter\s+(\d+)/i);
        if (chapterMatch) {
          const chapterNum = chapterMatch[1];
          // Remove redundant chapter numbers from section titles
          sectionTitle = sectionTitle.replace(new RegExp(`^${chapterNum}\\.\\s*`), '');
        }
      }
      
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
    // let currentNode = titleElement?.nextElementSibling;
    // while (currentNode) {
    //   editableContent += currentNode.outerHTML;
    //   currentNode = currentNode.nextElementSibling;
    // }
  
    const description = isCover ? 'Course cover image' : 
      (sections.length > 0 ? 
        `${sections.length} ${sections.length === 1 ? 'section' : 'sections'} available` : 
        "No sections found");
  
    return { title, description, sections, editableContent, isCover };
  };
  
  const handleChapterClick = (chapter: string, index: number) => {
    onSelectChapter(chapter, index);
    setSelectedChapterIndex(index);
  };

  const handleExpandClick = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  const handleDeleteClick = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    if (onDeleteChapter) {
      onDeleteChapter(index);
    }
  };

  return (
    <div className={` h-full flex flex-col ${isVisible ? 'w-full z-50 absolute max-w-[70vw]  md:w-80' : 'w-10'} 
      transition-all duration-300 ease-in-out overflow-hidden rounded-lg bg-white shadow-lg border border-purple-100`}>
      
      {/* Toggle button - positioned absolutely */}
      <div className="mt-6">
        
   
      <button 
        onClick={onToggleVisibility}
        className=" top-6 right-6 z-30 p-1  transition-colors"
        title={isVisible ? "Hide chapters" : "Show chapters"}
      >
        {isVisible ? (
          <ChevronLeft className="w-4 h-4 text-primary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-primary" />
        )}
      </button>
      </div>
      {/* Collapsed state view */}
      {!isVisible && (
        <div 
          onClick={onToggleVisibility}
          className="flex flex-col h-full items-center justify-center cursor-pointer hover:bg-purple-50/50 transition-colors"
        >
          <div className="flex flex-col items-center py-6">
            <Book className="w-5 h-5 text-primary mb-2" />
            <span className="vertical-text text-xs font-medium text-primary">Chapters</span>
          </div>
        </div>
      )}
      
      {/* Expanded state view */}
      {isVisible && (
        <>
          <div className="bg-white z-20 px-4 py-3 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-primary flex items-center">
              <Book className="w-5 h-5 mr-2 text-primary" />
              Course Chapters
            </h3>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent"
          >
            {chapters?.length > 0 ? (
              <div className="space-y-4">
                {chapters?.map((chapter, index) => {
                  const { title, description, sections, isCover } = parseChapter(chapter);
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
                                ${isHovered ? 'text-primary' : 'text-primary'}
                                ${selectedChapterIndex === index ? 'text-primary' : ''}
                              `}
                            />
                            <div className="flex-1 min-w-0">
                              <Tooltip 
                                content={title} 
                                position="top"
                                width="medium"
                              >
                                <h4 className={`text-sm font-medium truncate transition-colors duration-200
                                  ${selectedChapterIndex === index ? 'text-primary' : 'text-gray-800'}
                                `}>
                                  {title}
                                </h4>
                              </Tooltip>
                              <p className={`text-xs mt-1 transition-colors duration-200
                                ${selectedChapterIndex === index ? 'text-primary' : 'text-gray-500'}
                              `}>
                                {description}
                              </p>
                            </div>
                          </div>

                          <div className="transition-opacity duration-200 flex items-center gap-2">
                            {!isCover && (
                              <button
                                onClick={(e) => handleDeleteClick(e, index)}
                                className="p-1 rounded-full hover:bg-red-100 transition-colors"
                                title="Delete chapter"
                              >
                                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                              </button>
                            )}
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
        </>
      )}

      <style >{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thumb-purple-200::-webkit-scrollbar-thumb {
          background-color: #e9d5ff;
          border-radius: 9999px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default ChapterGallery;