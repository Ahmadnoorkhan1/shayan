// Example usage in StepFourCourseCreator.tsx
import SummaryDisplay from "../common/SummaryDisplay";

const StepFourCourseCreator = () => {
  const summary = localStorage.getItem('course_summary') || '';
  
  const handleSummaryUpdate = (updatedContent: string) => {
    // This will be called when the user saves the edited summary
    localStorage.setItem('course_summary', updatedContent);
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full">
      <SummaryDisplay
        title="Course Summary"
        content={summary}
        onSave={handleSummaryUpdate}
        type="course"
        alertMessage="Review your course summary below. This overview will help guide the content generation process."
        localStorageKey="course_summary"
      />
    </div>
  );
};

export default StepFourCourseCreator;