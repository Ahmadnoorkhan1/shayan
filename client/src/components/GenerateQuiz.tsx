import React, { useState } from 'react';
import { Button } from './ui/button';
import apiService from '../utilities/service/api';
import { ArrowDown, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface GenerateQuizProps {
  selectedChapter: string;
  onSaveQuiz?: (quizHTML: string, sharedQuizHTML: string) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
}

interface QuizResponse {
  quizTitle: string;
  quizType: string;
  questions: QuizQuestion[];
}

type QuizType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank';

export const GenerateQuiz: React.FC<GenerateQuizProps> = ({ selectedChapter, onSaveQuiz }) => {
  const [step, setStep] = useState<'select' | 'generating' | 'error'>('select');
  const [quizType, setQuizType] = useState<QuizType>('multiple-choice');
  const [quizCount, setQuizCount] = useState<number>(5);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuizTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuizType(e.target.value as QuizType);
  };

  const handleQuizCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuizCount(parseInt(e.target.value, 10));
  };

  const generateQuiz = async () => {
    if (!selectedChapter) {
      toast.error('No chapter content available to generate quiz');
      return;
    }

    try {
      setIsLoading(true);
      setStep('generating');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedChapter;
      const textContent = tempDiv.textContent || '';

      const response = await apiService.post('/generate-quiz', {
        chapterContent: textContent,
        quizType,
        questionCount: quizCount
      }, { timeout: 60000 });

      if (response.success && response.data) {
        const { editorQuizHTML, sharedQuizHTML } = formatQuizHTML(response.data);

        if (onSaveQuiz) {
          console.log(editorQuizHTML, sharedQuizHTML);
          onSaveQuiz(editorQuizHTML, sharedQuizHTML);
        }

        toast.success('Quiz added to chapter successfully!');
        setStep('select');
      } else if (response.data?.error) {
        setErrorMessage(response.data.error);
        setStep('error');
        toast.error('Failed to generate quiz: ' + response.data.error);
      } else {
        setErrorMessage(response.message || 'Unknown error occurred');
        setStep('error');
        toast.error(response.message || 'Failed to generate quiz');
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      setStep('error');
      toast.error('Error generating quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatQuizHTML = (quizData: QuizResponse): { editorQuizHTML: string, sharedQuizHTML: string } => {
    const quizId = `quiz-${Date.now()}`;

    let editorQuizHTML = `<h2>Exercises</h2>`;
    let sharedQuizHTML = `<h2>Exercises</h2>`;

    if (quizData.quizTitle) {
      editorQuizHTML += `<h3 style="font-weight: 600; margin-bottom: 16px;">${quizData.quizTitle}</h3>`;
      sharedQuizHTML += `<h3 style="font-weight: 600; margin-bottom: 16px;">${quizData.quizTitle}</h3>`;
    }

    editorQuizHTML += `<!-- quiz data: id="${quizId}" type="${quizData.quizType}" -->`;
    sharedQuizHTML += `<div class="quiz-container" id="${quizId}" data-quiz-type="${quizData.quizType}" data-quiz-title="${quizData.quizTitle}">`;

    quizData.questions.forEach((question, index) => {
      editorQuizHTML += `<p style="font-weight: bold; margin-top: 20px;">Question ${index + 1}: ${question.question}</p>`;
      sharedQuizHTML += `<div class="quiz-question" id="${quizId}-q${index}" data-question-id="${question.id}" data-correct-answer="${question.correctAnswer}"><p style="font-weight: bold; margin-top: 20px;">Question ${index + 1}: ${question.question}</p>`;

      if (question.options && (quizData.quizType === 'multiple-choice' || quizData.quizType === 'true-false')) {
        editorQuizHTML += '<ul style="list-style-type: upper-alpha; padding-left: 20px; margin: 10px 0;">';
        sharedQuizHTML += '<ul style="list-style-type: none; padding-left: 0; margin: 10px 0;">';

        Object.entries(question.options).forEach(([key, option]) => {
          editorQuizHTML += `<li style="margin-bottom: 5px;">${option}</li>`;
          sharedQuizHTML += `<li style="margin-bottom: 8px; display: flex; align-items: center;"><div class="circle-marker" data-option="${key}" style="display: inline-block; width: 18px; height: 18px; border: 1px solid #ccc; border-radius: 50%; margin-right: 8px;"></div><span><strong>${key}.</strong> ${option}</span></li>`;
        });

        editorQuizHTML += '</ul>';
        sharedQuizHTML += '</ul>';
      } else if (quizData.quizType === 'fill-in-the-blank') {
        editorQuizHTML += `<p style="margin: 10px 0;">Answer: <span style="text-decoration: underline; padding: 0 30px;">&nbsp;</span></p>`;
        sharedQuizHTML += `<div style="margin: 10px 0;"><input type="text" placeholder="Type your answer here" class="quiz-answer-field" style="border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 4px; width: 100%; max-width: 300px;" /></div>`;
      }

      sharedQuizHTML += `<div class="quiz-feedback correct-feedback" style="display: none; margin-top: 10px; padding: 8px 12px; background-color: #d1fae5; border-radius: 4px; color: #065f46;"><p><strong>Correct!</strong> ${question.explanation || ''}</p></div><div class="quiz-feedback incorrect-feedback" style="display: none; margin-top: 10px; padding: 8px 12px; background-color: #fee2e2; border-radius: 4px; color: #7f1d1d;"><p><strong>Incorrect.</strong> The correct answer is ${question.correctAnswer}. ${question.explanation || ''}</p></div></div>`;
    });

    sharedQuizHTML += `<div class="quiz-controls" style="margin-top: 20px;"><button type="button" class="quiz-submit-btn" data-quiz-id="${quizId}" style="background-color: #4338ca; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Check Answers</button></div><div class="quiz-results" style="display: none; margin-top: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;"><h4 style="margin-bottom: 10px;">Quiz Results</h4><p class="quiz-score">You scored: <span class="score-value">0</span>/<span class="total-questions">${quizData.questions.length}</span></p></div></div>`;

    return { editorQuizHTML, sharedQuizHTML };
  };

  if (!selectedChapter) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <ArrowDown className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Chapter Selected</h3>
        <p className="text-gray-500 mt-2">Please select a chapter first to generate a quiz.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'select' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Create Quiz Questions</h2>
            <p className="text-gray-600">Generate quiz questions based on chapter content.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="quiz-type" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Type
              </label>
              <select
                id="quiz-type"
                value={quizType}
                onChange={handleQuizTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="fill-in-the-blank">Fill in the Blank</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <select
                id="question-count"
                value={quizCount}
                onChange={handleQuizCountChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {[3, 5, 7, 10].map((num) => (
                  <option key={num} value={num}>{num} questions</option>
                ))}
              </select>
            </div>
          </div>
          
          <Button 
            onClick={generateQuiz} 
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : 'Generate and Add Quiz'}
          </Button>
        </div>
      )}

      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Generating Quiz...</h3>
          <p className="text-sm text-gray-500 mt-2">This might take a moment.</p>
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Failed to Generate Quiz</h3>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-md">{errorMessage}</p>
          <Button 
            onClick={() => setStep('select')}
            className="mt-6"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};