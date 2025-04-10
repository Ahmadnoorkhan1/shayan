import React from 'react';
import { Button } from './ui/button';
import { Loader2, RotateCw, Trash2, Check } from 'lucide-react';
import { determineQuizType, QuizType } from '../utilities/shared/quizUtils';
import './QuizDisplay.css';

interface QuizDisplayProps {
  quizContent: {
    editorContent: string;
    sharedContent: string;
  };
  onRegenerateQuestion: (index: number) => void;
  regeneratingQuestionIndex: number;
  onDeleteQuiz?: () => void;
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({
  quizContent,
  onRegenerateQuestion,
  regeneratingQuestionIndex,
  onDeleteQuiz
}) => {
  const renderMultipleChoice = (question: Element) => {
    const questionText = question.querySelector('p')?.innerHTML || '';
    const correctAnswer = question.getAttribute('data-correct-answer') || '';
    const options = Array.from(question.querySelectorAll('ul li')).map(li => {
      const span = li.querySelector('span');
      const option = span ? span.innerHTML : li.innerHTML;
      const optionLetter = span?.querySelector('strong')?.textContent?.replace('.', '') || '';
      
      return { text: option, letter: optionLetter, isCorrect: optionLetter === correctAnswer };
    });
    
    return (
      <div className="quiz-content">
        <p className="font-medium mb-4" dangerouslySetInnerHTML={{ __html: questionText }} />
        <ul className="space-y-3">
          {options.map((option, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className={`w-5 h-5 border-2 ${option.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded-full flex-shrink-0 flex items-center justify-center`}>
                {option.isCorrect && <Check className="h-3 w-3 text-green-600" />}
              </div>
              <span dangerouslySetInnerHTML={{ __html: option.text }} />
              {option.isCorrect && (
                <span className="ml-2 text-sm text-green-600 font-medium">Correct answer</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTrueFalse = (question: Element) => {
    const questionText = question.querySelector('p')?.innerHTML || '';
    const correctAnswer = question.getAttribute('data-correct-answer') || '';
    
    // Map A/B format to True/False
    let mappedCorrectAnswer = correctAnswer;
    if (correctAnswer === 'A') {
      mappedCorrectAnswer = 'True';
    } else if (correctAnswer === 'B') {
      mappedCorrectAnswer = 'False';
    }
    
    // Clean up question text if needed (removes "Question X:" prefix)
    const cleanQuestionText = questionText.replace(/^Question \d+:\s*/i, '');
    
    return (
      <div className="quiz-content">
        <p className="font-medium mb-4" dangerouslySetInnerHTML={{ __html: cleanQuestionText }} />
        <div className="space-y-3">
          {['True', 'False'].map((option) => {
            const isCorrect = option === mappedCorrectAnswer;
            return (
              <label key={option} className="flex items-center gap-3">
                <div className={`w-5 h-5 border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded-full flex-shrink-0 flex items-center justify-center`}>
                  {isCorrect && <Check className="h-3 w-3 text-green-600" />}
                </div>
                <span>{option}</span>
                {isCorrect && (
                  <span className="ml-2 text-sm text-green-600 font-medium">Correct answer</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFillInBlank = (question: Element) => {
    const questionText = question.querySelector('p')?.innerHTML || '';
    const correctAnswer = question.getAttribute('data-correct-answer') || '';
    
    return (
      <div className="quiz-content">
        <p className="font-medium mb-4" dangerouslySetInnerHTML={{ __html: questionText }} />
        <div className="flex flex-col gap-3">
          {/* <input 
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Type your answer here"
          /> */}
          <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-md">
            <span className="font-medium text-green-700">Correct answer: </span>
            <span className="text-green-700">{correctAnswer}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderShortAnswer = (question: Element) => {
    const questionText = question.querySelector('p')?.innerHTML || '';
    const correctAnswer = question.getAttribute('data-correct-answer') || '';
    const explanation = question.querySelector('.correct-feedback p:nth-child(2)')?.textContent || '';
    
    return (
      <div className="quiz-content">
        <p className="font-medium mb-4" dangerouslySetInnerHTML={{ __html: questionText }} />
        <div className="flex flex-col gap-3">
          {/* <textarea 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
            placeholder="Write your answer here"
          /> */}
          <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium text-green-700">Suggested answer:</p>
            <p className="text-green-700">{correctAnswer}</p>
            {explanation && <p className="mt-2 text-green-700">{explanation}</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderFlipCard = (card: Element) => {
    const front = card.querySelector('.flash-card-front')?.innerHTML || '';
    const back = card.querySelector('.flash-card-back')?.innerHTML || '';
  
    return (
      <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div className="flip-card-content" dangerouslySetInnerHTML={{ __html: front }} />
          </div>
          <div className="flip-card-back">
            <div className="flip-card-content" dangerouslySetInnerHTML={{ __html: back }} />
          </div>
        </div>
      </div>
    );
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(quizContent.sharedContent, 'text/html');
  const container = doc.querySelector('.quiz-container');
  const quizType = container?.getAttribute('data-quiz-type') as QuizType;
  const questions = quizType === 'flip-card' 
    ? Array.from(doc.querySelectorAll('.flash-card'))
    : Array.from(doc.querySelectorAll('.quiz-question'));

  const renderQuestion = (question: Element, index: number) => {
    switch (quizType) {
      case 'multiple-choice':
        return renderMultipleChoice(question);
      case 'true-false':
        return renderTrueFalse(question);
      case 'fill-in-the-blank':
        return renderFillInBlank(question);
      case 'short-answer':
        return renderShortAnswer(question);
      case 'flip-card':
        return renderFlipCard(question);
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-purple-800">Quiz Preview</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Type: {quizType || 'Multiple Choice'}</span>
            <span className="text-sm text-gray-500">Questions: {questions.length}</span>
          </div>
        </div>

        <div className={quizType === 'flip-card' ? 'flash-cards-grid' : 'space-y-6'}>
          {questions.map((question, index) => (
            <div 
              key={index} 
              className={quizType === 'flip-card' ? 
                'flip-card-wrapper' : 
                'bg-white shadow-sm rounded-lg p-4 md:p-6 border border-gray-200'}
            >
              {quizType === 'flip-card' ? (
                renderFlipCard(question)
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="text-sm text-gray-500 mb-3">Question {index + 1}</div>
                    {renderQuestion(question, index)}
                  </div>
                  
                  <Button
                    onClick={() => onRegenerateQuestion(index)}
                    disabled={regeneratingQuestionIndex === index}
                    variant="outline"
                    size="sm"
                    className="mt-4 md:mt-0 self-end md:self-start shrink-0 bg-purple-600 text-white"
                  >
                    {regeneratingQuestionIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {onDeleteQuiz && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={onDeleteQuiz}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Quiz</span>
          </Button>
        </div>
      )}
      
      <style>{`
        .flash-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        @media (max-width: 640px) {
          .flash-cards-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .flip-card-wrapper {
          min-height: 180px;
        }
      `}</style>
    </>
  );
};