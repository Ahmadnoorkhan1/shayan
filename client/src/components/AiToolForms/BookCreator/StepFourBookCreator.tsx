
import SummaryDisplay from "../common/SummaryDisplay";

const StepFourBookCreator = () => {
  const summary = localStorage.getItem('book_summary');
  
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full">
      <SummaryDisplay
        title="Book Summary"
        content={summary || ''}
        type="book"
        alertMessage="Review your book summary below. This overview will help guide the content generation process."
      />
    </div>
  );
};

export default StepFourBookCreator;