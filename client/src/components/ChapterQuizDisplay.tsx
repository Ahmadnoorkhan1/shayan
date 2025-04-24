import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';

interface QuizQuestion {
  number: number;
  question: string;
  answer: string;
}

interface ChapterQuizDisplayProps {
  quizContent: string;
  quizMessage?:any

}

const ChapterQuizDisplay: React.FC<ChapterQuizDisplayProps> = ({
  quizContent,
  quizMessage
 
}) => {
  // Parse quiz content into structured format
  const questions = useMemo(() => {
    if (!quizContent) return [];
    
    const questionRegex = /Question (\d+):\s*Q: (.*?)\s*A: (.*?)(?=Question \d+:|$)/gs;
    const matches = [...quizContent.matchAll(questionRegex)];
    
    return matches.map(match => ({
      number: parseInt(match[1], 10),
      question: match[2].trim(),
      answer: match[3].trim()
    }));
  }, [quizContent]);

  // If there's no quiz content or parsing failed
  if (!questions.length) {
    return null;
  }

  return (
    <div className="chapter-quiz-display">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Chapter Quiz</h2>

        {/* <span> {quizMessage} </span> */}
        
       
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuizQuestionCard 
            key={index}
            question={q}
          />
        ))}
      </div>
    </div>
  );
};

interface QuizQuestionCardProps {
  question: QuizQuestion;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  isRegenerating = false,
  onRegenerate
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white transition-all duration-200 hover:border-gray-300">
      <div 
        className="p-3.5 cursor-pointer flex justify-between items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 bg-purple-50 text-purple-700 text-lg font-large rounded flex items-center justify-center">
            {question.number}
          </span>
          
          <h3 className="text-lg text-gray-700 font-medium leading-5 line-clamp-2  pr-2">
            {question.question}
          </h3>
        </div>
        
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-0 border-t border-gray-100">
          <div className="mt-2 bg-gray-50 rounded p-3 text-md leading-relaxed text-gray-600">
            {question.answer}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterQuizDisplay;