import React from "react";
import ContentViewer from "../common/ContentViewer";

interface StepFiveEasyCourseCreatorProps {
  chaptersContent: string[];
  chapterFetchCount: number;
  onSave?: () => void;
  onBack?: () => void;
}

const StepFiveEasyCourseCreator: React.FC<StepFiveEasyCourseCreatorProps> = ({
  chaptersContent,
  chapterFetchCount,
  onSave,
  onBack
}) => {
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="easyCourse"
      onSave={onSave}
      onBack={onBack}
    />
  );
};

export default StepFiveEasyCourseCreator;