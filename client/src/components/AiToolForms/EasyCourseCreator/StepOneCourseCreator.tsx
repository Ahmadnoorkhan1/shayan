import React, { useState, useEffect } from "react";
import apiService from "../../../utilities/service/api";
import Spinner from "../../ui/spinner";

interface StepTwoProps {
  handleStepChange: CallableFunction;
}

const StepOneCourseCreatorTool: React.FC<StepTwoProps> = ({ handleStepChange }) => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTitles = async () => {
      const storedTitles = localStorage.getItem("easy_course_titles");
      if (!storedTitles) {
        const numberOfChapters = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        localStorage.setItem("number_of_easy_course_chapters", numberOfChapters.toString());
        try {
          const response: any = await apiService.post(
            "/easy-course-creator/step-1",
            {
              prompt: {
                chapterCount: numberOfChapters,
              },
            },
            null
          );

          if (response?.success) {
            const generatedChapterTitles = response.data;
            localStorage.setItem("easy_course_titles", JSON.stringify(generatedChapterTitles));
            setSuggestedTitles(Array.isArray(generatedChapterTitles) ? generatedChapterTitles : []);
          } else {
            setSuggestedTitles([]);
          }
        } catch (error) {
          console.error("Error:", error);
          setSuggestedTitles([]);
        }
      } else {
        try {
          const parsedTitles = JSON.parse(storedTitles);
          setSuggestedTitles(Array.isArray(parsedTitles) ? parsedTitles : []);
        } catch (error) {
          console.error("Error parsing stored titles:", error);
          setSuggestedTitles([]);
        }
      }
      setLoading(false);
    };

    fetchTitles();
  }, []);

  const selectTitle = (title: string) => {
    localStorage.setItem("selectedTitleEasyCourse", title);
    handleStepChange();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <h2 className="p-4 text-center text-primary md:text-lg text-base">
        Choose A More Detailed Title for Your Course Or enter your own below!
      </h2>

      {loading ? (
        <div className="my-8">
          <Spinner />
        </div>
      ) : suggestedTitles && suggestedTitles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 py-6">
          {suggestedTitles?.slice(3,9)?.map((title: string, index: number) => (
            <button
              key={index}
              className="p-4 h-full bg-primary border-2 border-gray-300 rounded-lg 
                         hover:scale-[1.03] transition duration-300 cursor-pointer 
                         flex items-center justify-center shadow-md"
              onClick={() => selectTitle(title)}
            >
              <h3 className="text-base font-bold text-white text-center line-clamp-3">
                {title}
              </h3>
            </button>
          ))}
        </div>
      ) : (
        <h3 className="p-4 text-center text-primary md:text-lg text-base">
          No suggested titles available. Please enter your own.
        </h3>
      )}

<div className="w-full max-w-4xl px-4 mt-8 mb-6">
      <label htmlFor="custom-title" className="text-sm font-medium text-gray-700 mb-2 block">
      Enter your own course topic or title:
    </label>
    
    <input
      id="custom-title"
      className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg shadow-sm text-base
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-all duration-200"
      type="text"
      placeholder="e.g., 'Advanced JavaScript for Web Developers'"
      onChange={(e) => localStorage.setItem("selectedTitleEasyCourse", e.target.value)}
    />
      </div>
    </div>
  );
};

export default StepOneCourseCreatorTool;