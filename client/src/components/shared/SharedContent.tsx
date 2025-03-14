import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import apiService from '../../utilities/service/api';
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatSharedContent } from '../../utilities/shared/tableUtils';

interface SharedContentProps {}

const SharedContent: React.FC<SharedContentProps> = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/shared/${type}/${id}`, {});
        
        if (response.success && response.data) {
          // Handle different types of content formats
          let processedContent;
          
          // Check if content is already stringified or needs to be
          if (typeof response.data.content === 'string') {
            try {
              // Try parsing it in case it's a JSON string
              processedContent = JSON.parse(response.data.content);
            } catch (e) {
              // If parsing fails, it might be a direct string
              processedContent = response.data.content;
            }
          } else {
            // If it's already an object/array, stringify it for processing
            processedContent = JSON.stringify(response.data.content);
          }
          
          console.log('Processing content for formatting:', processedContent);
          // Use the formatting and sanitization function from tableUtils
          const html = formatSharedContent(
            processedContent, 
            response.data.title || 'Shared Content', 
            (response.data.courseType || type) as 'course' | 'book'
          );
          
          console.log('HTML generated:', html.substring(0, 200) + '...');
          
          // Set the sanitized and formatted content
          setContent(html);
                  
        } else {
          setError(response.message || 'Failed to load content');
        }
      } catch (error: any) {
        console.error('Error fetching shared content:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedContent();
  }, [id, type]);

  useEffect(() => {
    // Initialize quiz interactivity after content has been rendered
    if (content && !loading) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        try {
          console.log('Setting up interactive elements');
          
          // Initialize quiz interactivity
          setupQuizInteractivity();
          
        } catch (e) {
          console.error('Error initializing interactive content:', e);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [content, loading]);

  // Function to set up all quiz interactivity
 // Function to set up all quiz interactivity
const setupQuizInteractivity = () => {
  console.log('Setting up quiz interactivity...');
  
  // 1. Handle multiple choice and true/false selection
  document.querySelectorAll('.circle-marker').forEach(marker => {
    marker.addEventListener('click', function(this: Element) {
      // Clear other selections in the same question
      const question = this.closest('.quiz-question');
      if (question) {
        question.querySelectorAll('.circle-marker').forEach(m => {
          m.classList.remove('selected');
          (m as HTMLElement).style.backgroundColor = 'transparent';
          (m as HTMLElement).style.borderColor = '#ccc';
        });
      }
      
      // Select this one with visual feedback
      this.classList.add('selected');
      (this as HTMLElement).style.backgroundColor = '#4338ca';
      (this as HTMLElement).style.borderColor = '#4338ca';
      
      console.log('Option selected:', this.getAttribute('data-option'));
    });
  });
  
  // 2. Set up check answer buttons
  document.querySelectorAll('.quiz-submit-btn').forEach(button => {
    button.addEventListener('click', function(this: Element) {
      const quizId = this.getAttribute('data-quiz-id');
      if (quizId) {
        console.log(`Checking answers for quiz: ${quizId}`);
        checkQuizAnswers(quizId);
      }
    });
  });
  
  // Hide all feedback and results containers initially
  document.querySelectorAll('.quiz-feedback, .quiz-results').forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });
  
  console.log('Quiz setup complete');
};

 // Function to check quiz answers
const checkQuizAnswers = (quizId: string) => {
  console.log(`Checking answers for quiz ${quizId}`);
  const quizContainer = document.getElementById(quizId);
  if (!quizContainer) {
    console.error(`Quiz container with ID ${quizId} not found`);
    return;
  }
  
  const quizType = quizContainer.getAttribute('data-quiz-type');
  console.log(`Quiz type: ${quizType}`);
  
  const questions = quizContainer.querySelectorAll('.quiz-question');
  console.log(`Found ${questions.length} questions`);
  
  let score = 0;
  
  questions.forEach((question, index) => {
    const correctAnswer = question.getAttribute('data-correct-answer');
    const correctFeedback = question.querySelector('.correct-feedback');
    const incorrectFeedback = question.querySelector('.incorrect-feedback');
    
    console.log(`Question ${index + 1} - Correct answer: ${correctAnswer}`);
    
    if (quizType === 'multiple-choice' || quizType === 'true-false') {
      // For multiple choice and true/false
      const selectedOption = question.querySelector('.circle-marker.selected');
      
      if (selectedOption) {
        const userAnswer = selectedOption.getAttribute('data-option');
        console.log(`User selected: ${userAnswer}`);
        
        if (userAnswer === correctAnswer) {
          score++;
          console.log('Correct answer!');
          if (correctFeedback) (correctFeedback as HTMLElement).style.display = 'block';
          if (incorrectFeedback) (incorrectFeedback as HTMLElement).style.display = 'none';
        } else {
          console.log('Incorrect answer');
          if (correctFeedback) (correctFeedback as HTMLElement).style.display = 'none';
          if (incorrectFeedback) (incorrectFeedback as HTMLElement).style.display = 'block';
        }
      } else {
        console.log('No option selected');
        if (correctFeedback) (correctFeedback as HTMLElement).style.display = 'none';
        if (incorrectFeedback) (incorrectFeedback as HTMLElement).style.display = 'block';
      }
    } 
    else if (quizType === 'fill-in-the-blank') {
      // For fill-in-the-blank
      const inputField = question.querySelector('.quiz-answer-field') as HTMLInputElement;
      
      if (inputField) {
        const userAnswer = inputField.value.trim().toLowerCase();
        const correctAnswerText = correctAnswer ? correctAnswer.toLowerCase() : '';
        
        console.log(`User input: "${userAnswer}", Correct answer: "${correctAnswerText}"`);
        
        if (userAnswer === correctAnswerText) {
          score++;
          console.log('Correct answer!');
          if (correctFeedback) (correctFeedback as HTMLElement).style.display = 'block';
          if (incorrectFeedback) (incorrectFeedback as HTMLElement).style.display = 'none';
        } else {
          console.log('Incorrect answer');
          if (correctFeedback) (correctFeedback as HTMLElement).style.display = 'none';
          if (incorrectFeedback) (incorrectFeedback as HTMLElement).style.display = 'block';
        }
      }
    }
  });
  
  // Show results
  const resultsContainer = quizContainer.querySelector('.quiz-results');
  const scoreValue = quizContainer.querySelector('.score-value');
  const totalQuestions = quizContainer.querySelector('.total-questions');
  
  console.log(`Final score: ${score}/${questions.length}`);
  
  if (resultsContainer) (resultsContainer as HTMLElement).style.display = 'block';
  if (scoreValue) scoreValue.textContent = score.toString();
  if (totalQuestions) totalQuestions.textContent = questions.length.toString();
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading content...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed to load content</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Render the content directly into the DOM
  return (
    <div className="shared-content-wrapper">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default SharedContent;