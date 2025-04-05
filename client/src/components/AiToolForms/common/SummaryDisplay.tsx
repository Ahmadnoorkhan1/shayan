import React from 'react';

interface SummaryDisplayProps {
  title: string;
  content: string;
  type?: 'book' | 'course' | 'article' | 'general';
  alertMessage?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  title,
  content,
  alertMessage = 'Review your summary below. This overview will help guide the content generation process.',
}) => {
  // Format content by splitting paragraphs
  const formattedContent = content
    ? content
        .replace(/\\"/g, '"') // Handle escaped quotes
        .replace(/^"|"$/g, '') // Remove surrounding quotes if present
    : 'Summary is being generated...';

  // Convert plain paragraphs to properly formatted paragraphs
  const paragraphs = formattedContent.split(/\n\n|\r\n\r\n/).filter(p => p.trim());

  return (
    <div className="w-full max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-primary pb-2 border-b-2 border-gray-200 inline-block">
          {title}
        </h2>
        <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-400 rounded-r-md">
          <p className="text-sm text-gray-600">{alertMessage}</p>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="prose prose-lg max-w-none">
          {paragraphs.length > 0 ? (
            <>
              {/* First paragraph gets special styling as introduction */}
              <p className="mb-6 text-gray-800 leading-relaxed font-medium text-lg">
                {paragraphs[0]}
              </p>
              
              {/* Divider */}
              <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full my-6 mx-auto"></div>
              
              {/* Remaining paragraphs */}
              {paragraphs.slice(1).map((paragraph, i) => (
                <p 
                  key={i} 
                  className="mb-5 text-gray-700 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
              
              {/* Visual end marker */}
              <div className="flex justify-center mt-8 mb-2">
                <span className="inline-block w-16 h-1 bg-gray-200 rounded-full"></span>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-60">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-2.5"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full w-64 mb-2.5"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full w-40"></div>
                </div>
                <p className="text-gray-500 italic">Summary is being generated...</p>
              </div>
            </div>
          )}
        </div>
      </div> 
    </div>
  );
};

export default SummaryDisplay;