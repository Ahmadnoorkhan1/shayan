import React, { useState, useEffect } from "react";
import apiService from "../../../utilities/service/api";
import Spinner from "../../ui/spinner";
import TitleSelectionComponent from "../common/TitleSelectionComponent";
import ContentTopicInput from '../common/ContentTopicInput';

interface StepTwoProps {
  handleStepChange: CallableFunction;
}

const StepOneCourseCreatorTool: React.FC<StepTwoProps> = ({ handleStepChange }) => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdvancedInput, setShowAdvancedInput] = useState<boolean>(false);

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
    
    // Store original topic if it's a custom title
    if (suggestedTitles && !suggestedTitles.includes(title) && !localStorage.getItem('original_easy_course_topic')) {
      localStorage.setItem('original_easy_course_topic', title);
    }
    
    handleStepChange();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner />
        <p className="mt-4 text-gray-600">Loading title suggestions...</p>
      </div>
    );
  }

  if (showAdvancedInput) {
    return (
      <div className="w-full max-w-4xl px-4 mt-8 mb-6">
        <ContentTopicInput 
          handleForm={(value:any) => {
            localStorage.setItem("selectedTitleEasyCourse", value);
            localStorage.setItem('original_easy_course_topic', value);
            handleStepChange();
          }}
          // title="Enter your own course topic or title"
          // description="Provide a detailed description for your course"
          placeholder="e.g., 'Advanced JavaScript for Web Developers'"
        />
        
        <button
          onClick={() => setShowAdvancedInput(false)}
          className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
        >
          ← Back to suggested titles
        </button>
      </div>
    );
  }

  return (
    <>
      <TitleSelectionComponent
        titles={suggestedTitles?.slice(3, 9) || []}
        onSelectTitle={selectTitle}
        contentType="Easy Course"
        showCustomInput={false}
      />
      
      <div className="w-full max-w-lg px-4 mt-2 mb-8 text-center">
        <button
          onClick={() => setShowAdvancedInput(true)}
          className="text-primary hover:text-primary/80 font-medium"
        >
          Need more options? Create an advanced custom title
        </button>
      </div>
    </>
  );
};

export default StepOneCourseCreatorTool;