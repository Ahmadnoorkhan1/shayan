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
    <div className="flex justify-center flex-col items-center">
      <h2 className="p-4 text-center text-primary md:text-lg text-base md:w-full w-1/2">
        Choose A More Detailed Title for Your Course Or click the link below to enter your own!
      </h2>

      {loading ? <Spinner /> : suggestedTitles && suggestedTitles.length > 0 ? (
        <div className="flex justify-between gap-8 pt-8 lg:w-[720px] w-[320px] overflow-scroll">
          {suggestedTitles.map((title: string, index: number) => (
            <button
              key={index}
              className="p-6 min-w-[250px] bg-primary border-2 border-gray-300 rounded-lg hover:scale-105 transition duration-500 cursor-pointer"
              onClick={() => selectTitle(title)}
            >
              <h3 className="my-2 text-lg font-bold text-white">{title}</h3>
            </button>
          ))}
        </div>
      ) : (
        <h3 className="p-4 text-center text-primary md:text-lg text-base md:w-full w-1/2">
          No suggested titles available. Please enter your own.
        </h3>
      )}

      <input
        className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        type="text"
        placeholder="Enter your topic on your own"
        onChange={(e) => localStorage.setItem("selectedTitleEasyCourse", e.target.value)}
      />
    </div>
  );
};

export default StepOneCourseCreatorTool;
