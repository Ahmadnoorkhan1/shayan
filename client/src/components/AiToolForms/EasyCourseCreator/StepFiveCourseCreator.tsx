import ContentViewer from "../common/ContentViewer";

interface EasyCourseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<EasyCourseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  // If there's a save function in the parent component, we can pass it here
  const handleSave = () => {
    // You can implement this if needed, or leave it out
    console.log('Easy course save button clicked');
  };
  
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="easyCourse"
      // onSave={handleSave}
    />
  );
};

export default StepFiveCourseCreator;