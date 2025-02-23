import { useEffect, useState } from "react";
import Spinner from "../../ui/spinner";
import MarkdownEditor from "../../ui/markdowneditor";
interface courseContentProps {
  chaptersContent: string[];
}

const StepFiveCourseCreator: React.FC<courseContentProps> = ({ chaptersContent }) => {
  const title = localStorage.getItem("selectedTitleEasyCourse") || "";
  const [content, setContent] = useState('');
  const chapter_titles = (localStorage.getItem("easy_course_chapter_titles") || "")
    .split(/,(?=\d+\.)/) // Split at numbered points
    .map((item: string) => item.replace(/^\d+\.\s*/, "").trim());
    useEffect(() => {
      let storedIndex = parseInt(localStorage.getItem("easyCourseChapterNumber") || "0", 10);
    
      // If new chapters are available, go to the latest one
      const latestIndex = chaptersContent.length - 1;
      if (latestIndex >= 0 && storedIndex < latestIndex) {
        storedIndex = latestIndex; // Auto-set to latest chapter
        localStorage.setItem("easyCourseChapterNumber", latestIndex.toString()); // Update storage
      }
    
      // Set content to the correct chapter
      if (chaptersContent.length > storedIndex) {
        setContent(chaptersContent[storedIndex]);
        console.log("Switched to latest chapter:", storedIndex, chaptersContent[storedIndex]);
      }
    }, [chaptersContent.length]); // Runs when new chapters are added
    
    useEffect(() => {
      if (content) {
        console.log("Content updated:", content);
      }
    }, [content]);

  return (
    <div className="flex flex-col items-center justify-center pb-8">
      <div className="flex lg:w-[720px] w-[325px] gap-2 items-center py-8 overflow-x-scroll">
        {chapter_titles &&
          chapter_titles.length &&
          chapter_titles.map((title: any, index: any) => {
            return (
              <button
                className={index <= chaptersContent.length ? 'w-[175px] p-4 btn-primary flex gap-2 ' : 'w-[175px] p-4 btn-secondary flex gap-2 '}
                key={title}
                disabled={index <= chaptersContent.length ? false : true}
                onClick={() => {
                  console.log('clicked', chaptersContent[index]);
                  localStorage.setItem('easyCourseChapterNumber', index);
                  chaptersContent[index]?.length ? setContent(chaptersContent[index]) : setContent('');
                }}
              >
                <span>Chapter </span><span>{index + 1}</span>
              </button>
            );
          })}
      </div>
      <h2 className="text-center text-primary">{title}</h2>
      {/* <textarea
        className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        name=""
        id=""
        rows={4}
        cols={8}
        value={content}
      > */}
      {/* {Object.keys(content).length > 0 ? content : <Spinner />} */}
      {/* </textarea> */}
      {/* <Markdown>{content}</Markdown> */}
        <div className="flex flex-col mx-auto gap-4 p-4">
        {content && <MarkdownEditor data={content || ''} />}
        </div>
      {!content && <Spinner />}
      {/* <Spinner /> */}
    </div>
  );
};

export default StepFiveCourseCreator;