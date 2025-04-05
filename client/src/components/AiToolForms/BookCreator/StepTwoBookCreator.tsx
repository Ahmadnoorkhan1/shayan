import React, { useEffect, useState } from "react";
import TitleSelectionComponent from "../common/TitleSelectionComponent";

interface StepTwoProps {
  handleStepChange: CallableFunction;
}

const StepTwoBookCreator: React.FC<StepTwoProps> = ({ handleStepChange }) => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [originalTopic, setOriginalTopic] = useState<string>('');
  
  useEffect(() => {
    // Load titles from localStorage
    try {
      const titlesFromStorage = localStorage.getItem('book_titles');
      if (titlesFromStorage) {
        const parsedTitles = JSON.parse(titlesFromStorage);
        setSuggestedTitles(Array.isArray(parsedTitles) ? parsedTitles : []);
      }
      
      // Also load the original topic if available
      const topic = localStorage.getItem('original_book_topic');
      if (topic) {
        setOriginalTopic(topic);
      }
    } catch (error) {
      console.error("Error loading titles from localStorage:", error);
    }
  }, []);

  const selectTitle = (title: string) => {
    localStorage.setItem('selectedBookTitle', title);
    
    // Store the original topic if this is a custom title
    if (!suggestedTitles.includes(title) && !localStorage.getItem('original_book_topic')) {
      localStorage.setItem('original_book_topic', title);
    }
    
    handleStepChange();
  };

  return (
    <TitleSelectionComponent
      titles={suggestedTitles?.slice(3, 9) || []}
      onSelectTitle={selectTitle}
      contentType="Book"
    />
  );
};

export default StepTwoBookCreator;