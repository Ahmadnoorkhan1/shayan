import React from "react";
import ContentViewer from "../common/ContentViewer";

interface StepFiveCourseCreatorProps {
  chaptersContent: string[];
  chapterFetchCount: number;
  onSave?: () => void;
  onBack?: () => void;
}

const StepFiveCourseCreator: React.FC<StepFiveCourseCreatorProps> = ({
  chaptersContent,
  chapterFetchCount,
  onSave,
  onBack
}) => {
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="course"
      onSave={onSave}
      onBack={onBack}
    />
  );
};

export default StepFiveCourseCreator;