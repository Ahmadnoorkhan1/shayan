import { useEffect, useState } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";

interface courseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<courseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  console.log("[StepFive] Rendering - chaptersContent:", chaptersContent, "chapterFetchCount:", chapterFetchCount);
  const title = localStorage.getItem("selectedTitle") || "";
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  const chapter_titles = (localStorage.getItem("chapter_titles") || "")
    .split(/,(?=\d+\.)/)
    .map((item: string) => item.replace(/^\d+\.\s*/, "").trim());

  console.log("[StepFive] chaptersContent received:", chaptersContent, "chapterFetchCount:", chapterFetchCount);

  useEffect(() => {
    console.log("[StepFive] useEffect triggered with chaptersContent:", chaptersContent, "chapterFetchCount:", chapterFetchCount);
    if (chaptersContent.length > 0) {
      // Find the latest index with content
      let latestIndex = -1;
      for (let i = chaptersContent.length - 1; i >= 0; i--) {
        if (chaptersContent[i] && chaptersContent[i] !== "") {
          latestIndex = i;
          break;
        }
      }
      console.log("[StepFive] Latest index with content:", latestIndex);
      if (latestIndex !== -1 && latestIndex !== currentChapterIndex) {
        setCurrentChapterIndex(latestIndex);
        localStorage.setItem("chapterNumber", latestIndex.toString());
        console.log(`[StepFive] Auto-set to chapter ${latestIndex + 1} with content:`, chaptersContent[latestIndex]);
      } else {
        console.log("[StepFive] No new content to switch to, keeping index at", currentChapterIndex);
      }
    }
  }, [chaptersContent, chapterFetchCount]);

  const hasContent = chaptersContent.length > 0 && !!chaptersContent[currentChapterIndex];
  console.log("[StepFive] Rendering - currentChapterIndex:", currentChapterIndex, "hasContent:", hasContent, "content:", chaptersContent[currentChapterIndex]);

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
              localStorage.setItem("chapterNumber", index.toString());
              console.log(`[StepFive] Manually switched to chapter ${index + 1}`);
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