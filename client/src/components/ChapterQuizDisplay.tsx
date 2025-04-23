import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';

interface QuizQuestion {
  number: number;
  question: string;
  answer: string;
}

interface ChapterQuizDisplayProps {
  quizContent: string;
  onDeleteQuiz?: () => void;
  onRegenerateQuestion?: (questionIndex: number) => Promise<void>;
  regeneratingQuestionIndex?: number;
}

const ChapterQuizDisplay: React.FC<ChapterQuizDisplayProps> = ({
  quizContent,
  onDeleteQuiz,
  onRegenerateQuestion,
  regeneratingQuestionIndex = -1
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
        
        {onDeleteQuiz && (
          <button
            onClick={onDeleteQuiz}
            className="text-red-500 hover:text-red-700 flex items-center text-sm"
            title="Delete this quiz"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove Quiz
          </button>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuizQuestionCard 
            key={index}
            question={q}
            isRegenerating={regeneratingQuestionIndex === index}
            onRegenerate={onRegenerateQuestion ? () => onRegenerateQuestion(index) : undefined}
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
    <div className="border border-gray-200 rounded-md shadow-sm bg-white">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-purple-100 text-purple-800 rounded-full w-6 h-6 text-sm font-medium flex-shrink-0">
              {question.number}
            </span>
            <h3 className="text-md font-medium text-gray-800">{question.question}</h3>
          </div>
        </div>
        <div className="flex items-center">
          {onRegenerate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              className={`mr-3 text-purple-500 hover:text-purple-700 ${isRegenerating ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={isRegenerating}
              title="Regenerate this question"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100 mt-2">
          <p className="text-sm text-gray-700">{question.answer}</p>
        </div>
      )}
    </div>
  );
};

export default ChapterQuizDisplay;