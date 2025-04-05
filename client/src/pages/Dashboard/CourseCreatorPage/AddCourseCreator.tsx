import { useState } from "react";
import StepFiveCourseCreator from "../../../components/AiToolForms/CourseCreator/StepFiveCourseCreator";
import StepFourCourseCreator from "../../../components/AiToolForms/CourseCreator/StepFourCourseCreator";
import StepOneCourseCreator from "../../../components/AiToolForms/CourseCreator/StepOneCourseCreator";
import StepsThirdCourseCreator from "../../../components/AiToolForms/CourseCreator/StepsThirdCourseCreator";
import StepTwoCourseCreatorTool from "../../../components/AiToolForms/CourseCreator/StepTwoCourseCreatorTool";
import Stepper from "../../../components/ui/ToolSteps";
import apiService from "../../../utilities/service/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const AddCourseCreator = () => {
  const [stepOneForm, setStepOneForm] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [chapatersData, setChaptersData] = useState<any>([]);
  const [courseTitles, setCourseTitles] = useState([]);
  const [saveButton, setSaveButton] = useState(false);
const [chapterFetchCount, setChapterFetchCount] = useState(0);

const navigate = useNavigate()

  const steps = [
    { label: "Give A Topic", icon: true },
    { label: "Select Title", icon: true },
    { label: "Outline", icon: true },
    { label: "Summary", icon: true },
    { label: "Pro Course", icon: true },
  ];
  const handleForm = (data: any) => {
    setStepOneForm(data);
  };
  const handleChildStepChange = () => {
    setCurrentStep((prev) => prev + 1);
  };
  const handleStepChange = async () => {
    try {
      const response: any = await apiService.post(
        "/course-creator/step-1",
        {
          prompt: stepOneForm,
        },
        {}
      );
      if (response.success) {
        localStorage.setItem("course_titles", JSON.stringify(response.data));
        setCourseTitles(response.data);
        console.log(courseTitles)
        setCurrentStep((prev) => prev + 1);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const generateSummary = async () => {
    console.log("generateSummary");
    const getTitle = localStorage.getItem("selectedTitle") || "";

    try {
      const response: any = await apiService.post(
        "/course-creator/step-3",
        {
          prompt: getTitle,
        },
        { timeout: 30000 }
      );
      if (response.success) {
        localStorage.setItem("course_summary", response.data);
        setCurrentStep((prev) => prev + 1);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  let chapterTitles:any = [];
  const generateCompleteCourse = async () => {
    const getTitle = localStorage.getItem("selectedTitle") || "";
    const savedCourseSummary = localStorage.getItem("course_summary") || "";
    const numberOfChapters = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
    localStorage.setItem("number_of_chapters", numberOfChapters.toString());
    console.log("generateCompleteCourse");
    try {
      const response: any = await apiService.post(
        "/course-creator/step-5",
        {
          prompt: {
            title: getTitle,
            summary: savedCourseSummary,
            numberOfChapters,
          },
        },
        null
      );
      if (response?.success) {
        // console.log(response.data, ' are these the tittles of my chapters?')
        // const generatedChapterTitles = response.data;
        // console.log(generatedChapterTitles)
        chapterTitles = response.data;
        localStorage.setItem("chapter_titles", response.data);
        setCurrentStep((prev) => prev + 1);
        fetchChaptersWithRateLimit(getTitle, savedCourseSummary);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const fetchChaptersWithRateLimit = async (getTitle: any, savedCourseSummary: any) => {
    const title = chapterTitles;
    const MAX_RETRIES = 5;

    setChaptersData(new Array(title.length).fill(""));
    console.log("[AddBook] Initialized chapatersData:", new Array(title.length).fill(""));

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
              summary: savedCourseSummary,
            },
          };

          console.log(`[AddBook] Fetching Chapter ${index + 1} (Attempt ${attempts + 1})...`);

          const chapterResponse = await apiService.post(
          "/course-creator/getCourseChapter",
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
            success = true;
          } else {
            throw new Error(chapterResponse.message);
          }
        } catch (error) {
          console.error(`[AddBook] Error fetching Chapter ${index + 1}:`, error);
          attempts++;
        }
      }

      if (!success) {
        toast.error(`Chapter ${index + 1} could not be fetched.`);
      }
    }

    setSaveButton(true);
  };

  const saveCompleteCourse = async() =>{
    console.log("saveCompleteCourse")
    try {
      const title = localStorage.getItem("selectedTitle");
      const body = {
        creator_id:1, // user._id,
        course_title:title,
        content: JSON.stringify(chapatersData)  
      }
      const response = await apiService.post('course-creator/addCourse/course',body,{});
      if (response.success) {
        const courseId = response?.data?.course_id?.toString(); // Get the correct ID
        toast.success('Course created successfully');
        // Navigate with the correct ID
        navigate(`/dashboard/course-creator?highlight=${courseId}`);
      }
      
    } catch (error) {
      console.log(error)
    }
  }
  

  // Call the function

  const renderForm = () => {
    switch (currentStep) {
      case 0:
        return <StepOneCourseCreator handleForm={handleForm} />;
      case 1:
        return (
          <StepTwoCourseCreatorTool handleStepChange={handleChildStepChange} />
        );
      case 2:
        return <StepsThirdCourseCreator />;
      case 3:
        return <StepFourCourseCreator />;
      case 4:
        return <StepFiveCourseCreator chaptersContent={chapatersData} chapterFetchCount={chapterFetchCount}  />;
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
        return <NextButton handleClick={handleStepChange} title="Next"  />;
      case 1:
        return null;
      case 2:
        return <NextButton handleClick={generateSummary} title="Next" />;
      case 3:
        return <NextButton handleClick={generateCompleteCourse} title="Next" />;
      case 4:
        return <>{saveButton && <NextButton handleClick={saveCompleteCourse} title="Save" />}</>;
      case 5:
        return null;
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
  handleClick: CallableFunction,
  title:string
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
      <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">
        {title || "Next"}
      </span>
      <span className="relative invisible">{title || "Next"}</span>
    </button>
  );
};

export default AddCourseCreator;
