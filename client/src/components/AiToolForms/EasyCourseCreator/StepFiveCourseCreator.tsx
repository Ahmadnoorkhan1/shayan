import { useEffect, useState } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";

interface courseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<courseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  const title = localStorage.getItem("selectedTitleEasyCourse") || "";
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  const chapter_titles = (localStorage.getItem("easy_course_chapter_titles") || "")
    .split(/,(?=\d+\.)/)
    .map((item: string) => item.replace(/^\d+\.\s*/, "").trim());

  // Watch for new chapters and automatically display the latest one
  useEffect(() => {
    if (chaptersContent.length > 0) {
      // Find the latest index with content
      let latestIndex = -1;
      for (let i = chaptersContent.length - 1; i >= 0; i--) {
        if (chaptersContent[i] && chaptersContent[i] !== "") {
          latestIndex = i;
          break;
        }
      }

      if (latestIndex !== -1 && latestIndex !== currentChapterIndex) {
        setCurrentChapterIndex(latestIndex);
        localStorage.setItem("easyCourseChapterNumber", latestIndex.toString());
        console.log(`Auto-set to chapter ${latestIndex + 1}`);
      }
    }
  }, [chaptersContent, chapterFetchCount]); // Run when chaptersContent changes

  const hasContent = chaptersContent.length > 0 && !!chaptersContent[currentChapterIndex];

  return (
    <div className="flex flex-col items-center justify-center pb-8">
      <div className="flex lg:w-[720px] w-[325px] gap-2 items-center py-8 overflow-x-scroll">
        {chapter_titles?.map((title: string, index: number) => (
          <button
            key={index}
            className={`w-[175px] p-4 ${
              index === currentChapterIndex 
                ? "btn-primary" 
                : chaptersContent[index] 
                  ? "btn-secondary" 
                  : "btn-disabled"
            } flex gap-2`}
            disabled={!chaptersContent[index]}
            onClick={() => {
              setCurrentChapterIndex(index);
              localStorage.setItem("easyCourseChapterNumber", index.toString());
            }}
          >
            <span>Chapter </span>
            <span>{index + 1}</span>
            {chaptersContent[index] && (
              <span className="ml-2 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      <h2 className="text-center mt-4 text-[36px] text-primary">{title}</h2>
      {hasContent ? (
        <div className="w-full">
          <MarkdownEditor 
            key={`chapter-${currentChapterIndex}`}
            data={chaptersContent[currentChapterIndex]} 
          />
        </div>
      ) : (
        <div className="w-full flex justify-center items-center py-8">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default StepFiveCourseCreator;