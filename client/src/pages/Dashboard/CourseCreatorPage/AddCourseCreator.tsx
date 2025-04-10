import ContentCreator from "../../../components/ContentCreator/ContentCreator";
import StepOneCourseCreator from "../../../components/AiToolForms/CourseCreator/StepOneCourseCreator";
import StepTwoCourseCreatorTool from "../../../components/AiToolForms/CourseCreator/StepTwoCourseCreatorTool";
import StepsThirdCourseCreator from "../../../components/AiToolForms/CourseCreator/StepsThirdCourseCreator";
import StepFourCourseCreator from "../../../components/AiToolForms/CourseCreator/StepFourCourseCreator";
import StepFiveCourseCreator from "../../../components/AiToolForms/CourseCreator/StepFiveCourseCreator";

const AddCourseCreator = () => {
  const courseSteps = [
    { label: "Give A Topic", icon: true },
    { label: "Select Title", icon: true },
    { label: "Outline", icon: true },
    { label: "Syllabus", icon: true },
    { label: "Complete Course", icon: true },
  ];

  // Just provide the component references, not the instances
  const courseComponents = [
    StepOneCourseCreator,
    StepTwoCourseCreatorTool,
    StepsThirdCourseCreator,
    StepFourCourseCreator,
    StepFiveCourseCreator
  ];

  const courseApiEndpoints = {
    titles: "/course-creator/step-1",
    summary: "/course-creator/step-3",
    chapters: "/course-creator/step-5",
    content: "/course-creator/getCourseChapter",
    saveContent: "course-creator/addCourse/course"
  };

  const courseStorageKeys = {
    titles: "course_titles",
    selectedTitle: "selectedTitle",
    chapterTitles: "chapter_titles",
    summary: "course_summary",
    numChapters: "number_of_chapters"
  };

  return (
    <ContentCreator
      contentType="course"
      steps={courseSteps}
      stepComponents={courseComponents as any}
      apiEndpoints={courseApiEndpoints}
      redirectPath="/dashboard/course-creator"
      storageKeys={courseStorageKeys}
    />
  );
};

export default AddCourseCreator;