// ChapterGallery.tsx
import React, { useState } from "react";
import { Book, ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react';

interface ChapterGalleryProps {
  chapters: string[];
  onSelectChapter: (chapter: string) => void;
  onSelectSection: (section: string) => void;
}

const ChapterGallery: React.FC<ChapterGalleryProps> = ({ chapters, onSelectChapter, onSelectSection }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<{chapter: number, section: number} | null>(null);
  
  const parseChapter = (markdown: string) => {
    const clean = markdown.replace(/```markdown\s*/, "").replace(/```/, "").trim();
    const titleMatch = clean.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1].replace(/[*_]/g, '') : "Untitled";
    
    const sections = clean.split(/(?=##\s)/).slice(1).map(section => {
      const sectionTitle = section.match(/^##\s*(.*)/m)?.[1] || "Untitled Section";
      const content = section.split('\n').slice(1).join('\n').trim();
      return { title: sectionTitle, content };
    });

    const description = sections.length > 0 ? 
      `${sections.length} ${sections.length === 1 ? 'section' : 'sections'} available` : 
      "No sections found";

    return { title, description, sections };
  };

  const handleChapterClick = (chapter: string) => {
    // Only select chapter content
    onSelectChapter(chapter);
  };

  const handleExpandClick = (event: React.MouseEvent, index: number) => {
    // Prevent the click event from bubbling up to the chapter card
    event.stopPropagation();
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  const handleSectionClick = (chapterIndex: number, sectionIndex: number, content: string) => {
    setSelectedSection({ chapter: chapterIndex, section: sectionIndex });
    onSelectSection(content);
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
                    onClick={() => handleChapterClick(chapter)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`
                      cursor-pointer p-3 bg-white rounded-lg
                      hover:bg-purple-50/50 transition-all duration-200
                      border border-purple-100 hover:border-purple-200
                      ${isExpanded ? 'shadow-md bg-purple-50/30' : 'hover:shadow-sm'}
                    `}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHovered ? 'text-purple-600' : 'text-purple-400'}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleExpandClick(e, index)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                      >
                        {isExpanded ? 
                          <ChevronUp className="w-4 h-4 text-purple-500" /> : 
                          <ChevronDown className="w-4 h-4 text-purple-500" />
                        }
                      </button>
                    </div>
                  </div>

                  {isExpanded && sections && sections?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {sections.map((section, sIdx) => {
                        const isSelected = selectedSection?.chapter === index && 
                                        selectedSection?.section === sIdx;
                        
                        return (
                          <div
                            key={sIdx}
                            onClick={() => handleSectionClick(index, sIdx, section.content)}
                            className={`
                              p-2.5 rounded-lg mx-4
                              cursor-pointer text-sm
                              transition-all duration-200
                              border border-transparent
                              flex items-center gap-2
                              ${isSelected ? 
                                'bg-purple-100 border-purple-300 text-purple-800 shadow-sm' : 
                                'hover:bg-purple-50/70 hover:border-purple-200 text-gray-600 hover:text-purple-700'
                              }
                            `}
                          >
                            <div className={`
                              w-1.5 h-1.5 rounded-full 
                              ${isSelected ? 
                                'bg-purple-500 ring-2 ring-purple-200' : 
                                'bg-purple-400/50'
                              }
                            `} />
                            <span className="flex-1 truncate">
                              {section.title}
                            </span>
                            {isSelected && (
                              <div className="w-1 h-4 bg-purple-500 rounded-full absolute -left-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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