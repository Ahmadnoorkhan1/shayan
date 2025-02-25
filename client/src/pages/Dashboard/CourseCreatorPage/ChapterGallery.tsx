// language: tsx
import React from "react";

interface ChapterGalleryProps {
  chapters: string[];
  onSelectChapter: (chapter: string) => void;
}

const ChapterGallery: React.FC<ChapterGalleryProps> = ({ chapters, onSelectChapter }) => {
  // Limit to the first two chapters if available.
  const displayChapters = chapters;

  // Parser to extract title and description from markdown.
  const parseChapter = (markdown: string) => {
    // Remove markdown fences.
    const clean = markdown.replace(/```markdown\s*/, "").replace(/```/, "").trim();
    // Extract title – assume the first line with '#' is the title.
    const titleMatch = clean.match(/^#\s*(.*)/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";
    // Create a short description from the rest of the content.
    let description = "";
    const lines = clean.split("\n").filter((line) => line.trim() !== "");
    if (lines.length > 1) {
      description = lines.slice(1).join(" ").substring(0, 120) + "...";
    }
    return { title, description };
  };

  return (
    <div
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      className="w-full sm:w-1/3 max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md"
    >
      <h3 className="text-2xl font-bold text-purple-800 mb-6">Course Chapters</h3>
      {displayChapters?.length > 0 ? (
        <div className="space-y-4">
          {displayChapters.map((chapter, index) => {
            const { title, description } = parseChapter(chapter);
            return (
              <div
                key={index}
                onClick={() => onSelectChapter(chapter)}
                className="cursor-pointer p-4 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-1 border-l-4 border-purple-500"
              >
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600 mt-2">{description}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-base">No chapters available</p>
      )}
    </div>
  );
};

export default ChapterGallery;