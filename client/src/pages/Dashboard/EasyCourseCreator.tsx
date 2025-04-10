import { useState, useEffect } from "react";
import StepFiveCourseCreator from "../../components/AiToolForms/EasyCourseCreator/StepFiveCourseCreator";
import StepOneCourseCreator from "../../components/AiToolForms/EasyCourseCreator/StepOneCourseCreator";
import Stepper from "../../components/ui/ToolSteps";
import apiService from "../../utilities/service/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const EasyCourseCreator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chapatersData, setChaptersData] = useState<any>([]);
  const [saveButton, setSaveButton] = useState(false);
  const [chapterFetchCount, setChapterFetchCount] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (currentStep === 0) {
          generateCompleteCourse();
        } else if (currentStep === 1 && saveButton) {
          saveCompleteCourse();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, saveButton, chapatersData]);

  const navigate = useNavigate()

  const steps = [
    { label: "Give A Topic", icon: true },
    { label: "Complete Course", icon: true },
  ];
  
  
  let chapterTitles:any = [];

  const handleChildStepChange = () => {
    generateCompleteCourse();
  };

  const generateCompleteCourse = async () => {
    const getTitle = localStorage.getItem("selectedTitleEasyCourse") || "";
    const numberOfChapters = localStorage.getItem("number_of_easy_course_chapters") || 0;
    console.log("generatingCompleteCourse");
    try {
      const response: any = await apiService.post(
        "/easy-course-creator/step-5",
        {
          prompt: {
            title: getTitle,
            numberOfChapters,
          },
        },
        null
      );
      if (response?.success) {
        chapterTitles = response.data;
        localStorage.setItem("easy_course_chapter_titles", response.data);
        setCurrentStep((prev) => prev + 1);
        localStorage.removeItem("easy_course_titles");
        fetchChaptersWithRateLimit(getTitle);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchChaptersWithRateLimit = async (
    getTitle: any,
  ) => {
    const title = chapterTitles;
    const MAX_RETRIES = 5; // Retry a maximum of 5 times per chapter
  
    console.log(title, "Are these the titles of my chapters?");
  
    for (let index = 0; index < title.length; index++) {
      const chapter = title[index];
      let attempts = 0;
      let success = false;
  
      while (attempts < MAX_RETRIES && !success) {
        try {
          const chapterPayload = {
            prompt: {
              chapterNo: index + 1,
              chapter,
              title: getTitle,
            },
          };
  
          console.log(
            `📢 Fetching Chapter ${index + 1} (Attempt ${attempts + 1})...`
          );
  
          const chapterResponse = await apiService.post(
            "/easy-course-creator/getCourseChapter",
            chapterPayload,
            { timeout: 600000 }
          );
  
          if (chapterResponse.success) {
            setChaptersData((prev: any) => {
              const newData = [...prev];
              newData[index] = chapterResponse.data;
              console.log(`[AddBook] Chapter ${index + 1} fetched:`, newData[index]);
              console.log(`[AddBook] Updated chapatersData:`, newData);
              return newData;
            });
            setChapterFetchCount((prev:any) => prev + 1); // Increment fetch count
            console.log(`✅ Chapter ${index + 1} fetched successfully.`);
            success = true;

          } else {
            throw new Error(chapterResponse.message);
          }
        } catch (error: any) {
          console.error(`❌ Error fetching Chapter ${index + 1}:`, error);
  
          if (error.response?.status === 429) {
            console.warn(`🚦 Rate limit reached. Retrying immediately...`);
          } else {
            console.warn(`🔁 Retrying immediately...`);
          }
  
          attempts++;
        }
      }
  
      if (!success) {
        console.error(
          `❌ Chapter ${index + 1} failed after ${MAX_RETRIES} attempts.`
        );
        toast.error(`Chapter ${index + 1} could not be fetched.`);
      }
    }
    setSaveButton(true);
    console.log("🎉 All chapters processed!");
  };
  
  const saveCompleteCourse = async() =>{
    try {
      const title = localStorage.getItem("selectedTitleEasyCourse");
      const body = {
        creator_id:1, // user._id,
        course_title:title,
        content:chapatersData 
      }
      const response = await apiService.post('course-creator/addCourse/course',body,{});
      if(response.success){
        const courseId = response?.data?.course_id?.toString();
        toast.success("Course Created Successfully");
        navigate(`/dashboard/course-creator?highlight=${courseId}`);

      }
      
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Call the function

  const renderForm = () => {
    switch (currentStep) {
      case 0:
        return <StepOneCourseCreator handleStepChange={handleChildStepChange} />;
      case 1:
        return <StepFiveCourseCreator chaptersContent={chapatersData} chapterFetchCount={chapterFetchCount} />;
      default:
        return null;
    }
  };
  const renderButtons = () => {
    return (
      <div className="pt-16 pb-4 flex gap-8">
       {currentStep > 0 && ( // Only show back button if not on first step
        <button
          onClick={() => setCurrentStep((prev: any) => prev - 1)}
          className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-primary bg-opacity-5 transition duration-300 ease-out border-2 border-primary rounded-full shadow-md group"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 translate-x-full bg-primary group-hover:translate-x-0 ease">
            <svg
              className="w-6 h-6 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">
            Back
          </span>
          <span className="relative invisible">Back</span>
        </button>
      )}
        {conditionalNextButtons()}
      </div>
    );
  };
  const conditionalNextButtons = () => {
    switch (currentStep) {
      case 0:
        return <NextButton handleClick={generateCompleteCourse} title="Next"  />;
      case 1:
        return <>{saveButton && <NextButton handleClick={saveCompleteCourse} title="Save" />}</>;
        // <NextButton />;
    }
  };
  return (
    <div className="flex items-center p-2 w-full ">
      <Stepper
        renderForm={renderForm}
        renderButtons={renderButtons}
        currentStep={currentStep}
        steps={steps}
      />
    </div>
  );
};

interface ButtonProps {
  handleClick: CallableFunction;
  title:string;
}
const NextButton: React.FC<ButtonProps> = ({ handleClick,title }) => {
  return (
    <button
      onClick={() => handleClick()}
      className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-primary bg-opacity-5 transition duration-300 ease-out border-2 border-primary rounded-full shadow-md group"
    >
      <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-primary group-hover:translate-x-0 ease">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          ></path>
        </svg>
      </span>
      <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">        {title || "Next"}
      </span>
      <span className="relative invisible">{title || "Next"}</span>
    </button>
  );
};

export default EasyCourseCreator;