import ContentViewer from "../common/ContentViewer";

interface CourseContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveCourseCreator: React.FC<CourseContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="course"
    />
  );
};

export default StepFiveCourseCreator;