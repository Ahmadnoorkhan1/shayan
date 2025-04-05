import React from 'react';

interface ContentTopicInputProps {
  handleForm: CallableFunction;
  title?: string;
  description?: string;
  placeholder?: string;
}

const ContentTopicInput: React.FC<ContentTopicInputProps> = ({
  handleForm,
  title = "What's your content all about?",
  description = "Enter a topic for your content. Don't worry, you can always change it later 🙂",
  placeholder = "Enter your topic"
}) => {
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
        onChange={(e) => handleForm(e.target.value)}
      />
    </div>
  );
};

export default ContentTopicInput;