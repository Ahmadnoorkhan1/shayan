// ChapterGallery.tsx
import React, { useState, useEffect } from "react";
import { Book, ChevronDown, ChevronUp, FileText, BookOpen, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import Tooltip from "../../../components/ui/tooltip";

interface ChapterGalleryProps {
  chapters: any[];
  onSelectChapter: (chapter: string, index: number) => void;
  onDeleteChapter?: (index: number) => void;
  isVisible: boolean; // Prop to control visibility
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
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
    
    // On mobile, close the drawer after selection
    if (isMobile) {
      onToggleVisibility();
    }
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
    <div 
      className={`
        flex transition-all duration-300 ease-in-out overflow-hidden bg-white border border-purple-100 shadow-lg
        ${isMobile 
          ? isVisible 
            ? 'fixed inset-0 z-40 h-screen w-screen md:relative md:inset-auto md:h-full md:w-80' 
            : 'h-10 w-full'
          : isVisible 
            ? 'h-full md:w-80 rounded-lg' 
            : 'h-full w-20 rounded-lg'
        }
      `}
    >
      {/* Mobile collapsed state - horizontal bar */}
      {isMobile && !isVisible && (
        <div 
          onClick={onToggleVisibility}
          className="w-full h-10 flex items-center justify-between px-4 cursor-pointer bg-white hover:bg-purple-50 transition-colors border-b-4 border-purple-100 hover:border-purple-300 shadow-sm"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-1.5 mr-2">
              <Book className="w-4 h-4 text-purple-700" />
            </div>
            <span className="text-sm font-medium text-purple-700">Chapters</span>
            <div className="ml-2 text-xs text-purple-500 animate-pulse">(tap to view)</div>
          </div>
          <div className="bg-purple-500 rounded-full p-1 shadow-md">
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}
      
      {/* Desktop collapsed state - vertical bar */}
      {!isMobile && !isVisible && (
        <div 
          onClick={onToggleVisibility}
          className="flex flex-col h-full items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors border-r-4 border-purple-100 hover:border-purple-300 relative"
        >
          <div className="flex flex-col items-center py-6 px-1">
            <div className="bg-purple-100 rounded-full p-2 mb-3 hover:bg-purple-200 transition-colors">
              <Book className="w-5 h-5 text-purple-700" />
            </div>
            <span className="vertical-text text-xs font-medium text-primary mb-3">Chapters</span>
            <div className="absolute right-[-5px] h-20 w-2 flex items-center">
              <div className="bg-purple-500 rounded-full p-1 shadow-md">
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="mt-4 bg-purple-100 hover:bg-purple-200 transition-colors p-1 rounded-full animate-pulse">
              <ChevronRight className="w-4 h-4 text-purple-700" />
            </div>
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="h-full w-1 bg-gradient-to-b from-transparent via-purple-200/30 to-transparent"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Expanded state view */}
      {isVisible && (
        <div className="flex flex-col w-full h-full">
          <div className="bg-white sticky top-0 z-50 px-4 py-3 border-b border-purple-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary flex items-center">
              <Book className="w-5 h-5 mr-2 text-primary" />
              Course Chapters
            </h3>
            <button 
              onClick={onToggleVisibility}
              className="p-1.5 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors shadow-sm"
              aria-label={isMobile ? "Close chapters panel" : "Collapse chapters panel"}
            >
              {isMobile ? (
                <ChevronUp className="w-4 h-4 text-purple-700" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-purple-700" />
              )}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 md:z-0 z-50 sm:space-y-3 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
            {chapters?.length > 0 ? (
              <div className="space-y-3">
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
                          cursor-pointer p-2 sm:p-3 bg-white rounded-lg
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
                        <div className="flex justify-between items-start gap-2 sm:gap-3 relative z-10">
                          <div className="flex items-start gap-1 sm:gap-2 min-w-0">
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
                                <h4 className={`text-xs sm:text-sm font-medium truncate transition-colors duration-200
                                  ${selectedChapterIndex === index ? 'text-primary' : 'text-gray-800'}
                                `}>
                                  {title}
                                </h4>
                              </Tooltip>
                              <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 transition-colors duration-200
                                ${selectedChapterIndex === index ? 'text-primary' : 'text-gray-500'}
                              `}>
                                {description}
                              </p>
                            </div>
                          </div>

                          <div className="transition-opacity duration-200 flex items-center gap-1 sm:gap-2">
                            {!isCover && (
                              <button
                                onClick={(e) => handleDeleteClick(e, index)}
                                className="p-1 rounded-full hover:bg-red-100 transition-colors"
                                title="Delete chapter"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 hover:text-red-600" />
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
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No chapters found</p>
                <p className="text-gray-400 text-xs mt-1">Add chapters to your course to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default ChapterGallery;