import React, { useState, useEffect } from 'react';

interface ContentTopicInputProps {
  handleForm: CallableFunction;
  title?: string;
  description?: string;
  placeholder?: string;
  contentType?: 'book' | 'course' | 'easyCourse'; // Added to determine which localStorage key to use
}

const ContentTopicInput: React.FC<ContentTopicInputProps> = ({
  handleForm,
  title = "What's your content all about?",
  description = "Enter a topic for your content. Don't worry, you can always change it later 🙂",
  placeholder = "Enter your topic",
  contentType = 'course' // Default to course if not specified
}) => {
  // Determine the appropriate localStorage key based on contentType
  const getStorageKey = () => {
    switch (contentType) {
      case 'book':
        return 'book_topic';
      case 'easyCourse':
        return 'easy_course_topic';
      case 'course':
      default:
        return 'course_topic';
    }
  };

  // Initialize state with value from localStorage if available
  const [inputValue, setInputValue] = useState(() => {
    const savedValue = localStorage.getItem(getStorageKey());
    return savedValue || '';
  });

  // Update localStorage when input changes
  useEffect(() => {
    if (inputValue) {
      localStorage.setItem(getStorageKey(), inputValue);
      // Also call the handleForm function to propagate the value up
      handleForm(inputValue);
    }
  }, [inputValue, getStorageKey, handleForm]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    handleForm(value);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="p-4 text-center text-primary text-2xl">
        "{title}"
      </h2>
      
      <p className="text-center text-gray-600 mb-2">
        {description}
      </p>
      
      <input
        className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && inputValue.trim()) {
            // Trigger form submission on Enter key press
            handleForm(inputValue);
          }
        }}
      />
    </div>
  );
};

export default ContentTopicInput;