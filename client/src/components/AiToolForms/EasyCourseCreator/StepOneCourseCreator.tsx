import React, { useState, useEffect } from "react";
import apiService from "../../../utilities/service/api";
import Spinner from "../../ui/spinner";
import TitleSelectionComponent from "../common/TitleSelectionComponent";
import ContentTopicInput from '../common/ContentTopicInput';
import { RefreshCw } from "lucide-react"; // Import refresh icon

interface StepTwoProps {
  handleStepChange: CallableFunction;
}

const StepOneCourseCreatorTool: React.FC<StepTwoProps> = ({ handleStepChange }) => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdvancedInput, setShowAdvancedInput] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const fetchTitles = async (forceRefresh = false) => {
    // Clear stored titles if forcing refresh
    if (forceRefresh) {
      localStorage.removeItem("easy_course_titles");
      setRegenerating(true);
    }

    const storedTitles = localStorage.getItem("easy_course_titles");
    if (!storedTitles || forceRefresh) {
      // Generate a random number of chapters between 10-20
      const numberOfChapters = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
      localStorage.setItem("number_of_easy_course_chapters", numberOfChapters.toString());
      
      try {
        // Add randomization parameter to API call
        const response: any = await apiService.post(
          "/easy-course-creator/step-1",
          {
            prompt: {
              chapterCount: numberOfChapters,
              randomSeed: Math.random(), // Add randomization seed
              diversityLevel: "high" // Request higher diversity in titles
            },
          },
          null
        );

        if (response?.success) {
          const generatedChapterTitles = response.data;
          // Shuffle the array before storing for additional randomness
          const shuffledTitles = generatedChapterTitles.sort(() => 0.5 - Math.random());
          localStorage.setItem("easy_course_titles", JSON.stringify(shuffledTitles));
          setSuggestedTitles(Array.isArray(shuffledTitles) ? shuffledTitles : []);
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
        // Shuffle the titles each time they're loaded from localStorage
        const shuffledStoredTitles = [...parsedTitles].sort(() => 0.5 - Math.random());
        setSuggestedTitles(Array.isArray(shuffledStoredTitles) ? shuffledStoredTitles : []);
      } catch (error) {
        console.error("Error parsing stored titles:", error);
        setSuggestedTitles([]);
      }
    }
    setLoading(false);
    setRegenerating(false);
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const handleRegenerateTitles = () => {
    setLoading(true);
    fetchTitles(true); // Pass true to force refresh
  };

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
        <p className="mt-4 text-gray-600">
          {regenerating ? "Generating new title suggestions..." : "Loading title suggestions..."}
        </p>
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

  // Select a random set of 6 titles each time, rather than always the same slice
  const displayTitles = suggestedTitles 
    ? [...suggestedTitles].sort(() => 0.5 - Math.random()).slice(0, 6) 
    : [];

  return (
    <>
      <div className="w-full flex justify-end max-w-lg px-4 mb-2">
        <button
          onClick={handleRegenerateTitles}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          disabled={loading || regenerating}
        >
          <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
          Regenerate titles
        </button>
      </div>
      
      <TitleSelectionComponent
        titles={displayTitles}
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