import React from "react";
import ContentViewer from "../common/ContentViewer";

interface StepFiveBookCreatorProps {
  chaptersContent: string[];
  chapterFetchCount: number;
  onSave?: () => void;
  onBack?: () => void;
}

const StepFiveBookCreator: React.FC<StepFiveBookCreatorProps> = ({
  chaptersContent,
  chapterFetchCount,
  onSave,
  onBack
}) => {
  return (
    <ContentViewer
      chaptersContent={chaptersContent}
      chapterFetchCount={chapterFetchCount}
      titleType="book"
      onSave={onSave}
      onBack={onBack}
    />
  );
};

export default StepFiveBookCreator;