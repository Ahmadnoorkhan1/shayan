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
          }

          const html = await formatSharedContent(
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
    // Initialize all interactive elements after content has been rendered
    if (content && !loading) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        try {
          console.log('Setting up all interactive elements');
          
          // Setup all interactive elements
          setupQuizInteractivity();
          setupFlashCards();
          setupShortAnswerQuestions();
          
        } catch (e) {
          console.error('Error initializing interactive content:', e);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [content, loading]);

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
      // Skip if it's a short answer button - those are handled separately
      if (button.closest('.short-answer-question') ) {
        return;
      }
      
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

  // Function to set up flash cards
  const setupFlashCards = () => {
    console.log('Setting up flash cards...');
    
    try {
      const flashCards = document.querySelectorAll('.flash-card');
      console.log(`Found ${flashCards.length} flash cards`);
      
      if (flashCards.length === 0) return;
      
      // Ensure CSS is properly applied with correct styling
      const style = document.createElement('style');
      style.textContent = `
        .flash-card-inner.flipped {
          transform: rotateY(180deg) !important;
        }
        .flash-card-inner {
          transform-style: preserve-3d !important;
          transition: transform 0.6s;
        }
      `;
      document.head.appendChild(style);
      
      flashCards.forEach((card, index) => {
        const cardInner = card.querySelector('.flash-card-inner');
        if (!cardInner) {
          console.warn(`Flash card ${index + 1} missing inner element`);
          return;
        }
        
        // Set explicit styles to ensure 3D effect works
        (cardInner as HTMLElement).style.transformStyle = 'preserve-3d';
        
        // Remove existing click handlers to prevent duplicates
        const newCard = card.cloneNode(true) as HTMLElement;
        if (card.parentNode) {
          card.parentNode.replaceChild(newCard, card);
        }
        
        // Add new click handler
        newCard.addEventListener('click', function() {
          const inner = this.querySelector('.flash-card-inner');
          if (!inner) return;
          
          console.log(`Flash card ${index + 1} clicked`);
          if (inner.classList.contains('flipped')) {
            inner.classList.remove('flipped');
          } else {
            inner.classList.add('flipped');
          }
        });
      });
      
      console.log('Flash cards setup complete');
    } catch (error) {
      console.error('Error setting up flash cards:', error);
    }
  };

  // Function to set up short answer questions
 // Updated function to set up short answer questions and remove any check answers buttons
const setupShortAnswerQuestions = () => {
  console.log('Setting up short answer questions...');
  
  try {
    // First, find all quiz containers that are short-answer type
    const shortAnswerQuizContainers = document.querySelectorAll('[data-quiz-type="short-answer"]');
    console.log(`Found ${shortAnswerQuizContainers.length} short answer quiz containers`);
    
    // For each short-answer quiz container, find and remove the main Check Answers button
    shortAnswerQuizContainers.forEach((quizContainer) => {
      // Find buttons that are directly inside the quiz container (not within question)
      // and have text containing "Check" or "Submit"
      const checkButtons = quizContainer.querySelectorAll('.quiz-submit-btn');
      checkButtons.forEach(btn => {
        const btnText = (btn as HTMLElement).innerText.toLowerCase();
        if (btnText.includes('check') || btnText.includes('submit')) {
          // If it's a check/submit button, remove it
          btn.remove();
          console.log('Removed a Check Answers button from short answer quiz');
        }
      });
      
      // Also hide any results container
      const resultsContainers = quizContainer.querySelectorAll('.quiz-results');
      resultsContainers.forEach(container => {
        (container as HTMLElement).style.display = 'none';
        (container as HTMLElement).setAttribute('aria-hidden', 'true');
      });
    });

    // Now set up the individual short answer questions as normal
    const shortAnswerQuestions = document.querySelectorAll('.short-answer-question');
    console.log(`Found ${shortAnswerQuestions.length} short answer questions`);
    
    if (shortAnswerQuestions.length === 0) return;
    
    shortAnswerQuestions.forEach((question, index) => {
      // First hide the feedback
      const feedback = question.querySelector('.correct-feedback');
      if (feedback) {
        (feedback as HTMLElement).style.display = 'none';
      }
      
      // Look for existing button
      let button = question.querySelector('.quiz-submit-btn');
      
      // If no button found, create one
      if (!button) {
        button = document.createElement('button');
        button.className = 'quiz-submit-btn show-answer-btn';
        button.textContent = 'Show Answer';
        
        // Style the button
        const btnStyle = (button as HTMLElement).style;
        btnStyle.backgroundColor = '#650AAA';
        btnStyle.color = 'white';
        btnStyle.padding = '8px 16px';
        btnStyle.border = 'none';
        btnStyle.borderRadius = '4px';
        btnStyle.marginTop = '15px';
        btnStyle.cursor = 'pointer';
        
        question.appendChild(button);
      } else {
        // Make sure it says "Show Answer"
        button.textContent = 'Show Answer';
      }
      
      // Remove existing listeners by cloning
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
      
      // Add click handler
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Short answer button clicked for question ${index + 1}`);
        
        // Show the feedback
        if (feedback) {
          (feedback as HTMLElement).style.display = 'block';
        }
      });
    });
    
    console.log('Short answer questions setup complete');
  } catch (error) {
    console.error('Error setting up short answer questions:', error);
  }
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