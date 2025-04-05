import ContentViewer from "../common/ContentViewer";

interface BookContentProps {
  chaptersContent: string[];
  chapterFetchCount: number;
}

const StepFiveBookCreator: React.FC<BookContentProps> = ({ chaptersContent, chapterFetchCount }) => {
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="book"
    />
  );
};

export default StepFiveBookCreator;