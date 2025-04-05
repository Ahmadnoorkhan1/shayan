
import SummaryDisplay from "../common/SummaryDisplay";

const StepFourCourseCreator = () => {
  const summary = localStorage.getItem('course_summary');
  
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full">
      <SummaryDisplay
        title="Course Summary"
        content={summary || ''}
        type="course"
        alertMessage="Review your course summary below. This overview will help guide the content generation process."
      />
    </div>
  );
};

export default StepFourCourseCreator;