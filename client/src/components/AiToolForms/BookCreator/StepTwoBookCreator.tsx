import React, { useEffect, useState } from "react";
import TitleSelectionComponent from "../common/TitleSelectionComponent";
import apiService from "../../../utilities/service/api";

interface StepTwoProps {
  handleStepChange: () => void;
}

const StepTwoBookCreator: React.FC<StepTwoProps> = ({ handleStepChange }) => {
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [originalTopic, setOriginalTopic] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  
  // Function to fetch titles from API or localStorage
  const fetchTitles = async (forceRefresh = false) => {
    // If forcing refresh, clear existing titles
    if (forceRefresh) {
      localStorage.removeItem('book_titles');
      setIsRegenerating(true);
    }
    
    try {
      // Check if we have titles in localStorage
      const storedTitles = localStorage.getItem('book_titles');
      
      if (!storedTitles || forceRefresh) {
        // Get topic from localStorage
        const prompt = localStorage.getItem('book_topic') || '';
        
        // Make API call to get new titles
        const response = await apiService.post(
          "/book-creator/step-1",
          { prompt },
          { timeout: 60000 }
        );
        
        if (response.success && response.data) {
          // Shuffle titles for variety
          const shuffledTitles = Array.isArray(response.data) 
            ? [...response.data].sort(() => 0.5 - Math.random()) 
            : [response.data];
            
          // Store in localStorage
          localStorage.setItem('book_titles', JSON.stringify(shuffledTitles));
          setSuggestedTitles(shuffledTitles);
        } else {
          console.error("Error generating titles:", response.message);
        }
      } else {
        // Use titles from localStorage
        const parsedTitles = JSON.parse(storedTitles);
        setSuggestedTitles(Array.isArray(parsedTitles) ? parsedTitles : []);
      }
    } catch (error) {
      console.error("Error loading titles:", error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  // Load titles on component mount
  useEffect(() => {
    // Also load the original topic if available
    const topic = localStorage.getItem('original_book_topic');
    if (topic) {
      setOriginalTopic(topic);
    }
    
    fetchTitles();
  }, []);
  
  // Handle regenerating titles
  const handleRegenerateTitles = () => {
    fetchTitles(true);
  };

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
      titles={suggestedTitles.slice(0,9) || []}
      onSelectTitle={selectTitle}
      contentType="Book"
      onRegenerateTitle={handleRegenerateTitles}
      isRegenerating={isRegenerating}
    />
  );
};

export default StepTwoBookCreator;