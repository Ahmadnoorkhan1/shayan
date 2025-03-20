import apiService from '../../../utilities/service/api';
import toast from 'react-hot-toast';

export const ShortAnswerQuestions = {
  initialize: () => {
    console.log('Setting up short answer questions...');
    
    try {
      // Find all quiz containers that are short-answer type
      const shortAnswerQuizContainers = document.querySelectorAll('[data-quiz-type="short-answer"]');
      console.log(`Found ${shortAnswerQuizContainers.length} short answer quiz containers`);
      
      if (shortAnswerQuizContainers.length === 0) {
        return; // No short answer quizzes found
      }
      
      // For each short-answer quiz container, set up individual question checks
      shortAnswerQuizContainers.forEach((quizContainer) => {
        // Hide the global check button since we're not using it
        const globalCheckButton = quizContainer.querySelector('.quiz-submit-btn');
        if (globalCheckButton) {
          (globalCheckButton as HTMLElement).style.display = 'none';
        }
        
        // Set up individual questions with their own check buttons
        const questions = quizContainer.querySelectorAll('.quiz-question');
        questions.forEach((question) => {
          const textarea = question.querySelector('textarea');
          if (!textarea) return;
          
          // Add proper styling to textareas
          (textarea as HTMLElement).className = 'w-full min-h-[100px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500';
          
          // Add an individual check button for each question
          const questionId = question.id;
          const textareaContainer = textarea.parentNode;
          
          if (textareaContainer) {
            // Create a check button if it doesn't exist
            let checkButton = question.querySelector('.check-individual-btn');
            
            if (!checkButton) {
              checkButton = document.createElement('button');
              checkButton.className = 'check-individual-btn mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors';
              checkButton.textContent = 'Check Answer';
              textareaContainer.appendChild(checkButton);
              
              // Add event listener to check just this question
              checkButton.addEventListener('click', async () => {
                await ShortAnswerQuestions.checkIndividualAnswer(question);
              });
            }
          }
        });
      });
      
      console.log('Short answer questions setup complete');
    } catch (error) {
      console.error('Error setting up short answer questions:', error);
    }
  },
  
  // Method to check an individual short answer
  checkIndividualAnswer: async (question: Element) => {
    try {
      const correctAnswer = question.getAttribute('data-correct-answer') || '';
      const questionId = question.getAttribute('data-question-id') || '';
      const textarea = question.querySelector('textarea') as HTMLTextAreaElement;
      
      if (!textarea) return;
      
      const userAnswer = textarea.value.trim();
      if (!userAnswer) {
        toast.error('Please enter an answer before checking.');
        return;
      }
      
      // Show loading state
      const checkButton = question.querySelector('.check-individual-btn') as HTMLButtonElement;
      if (checkButton) {
        const originalText = checkButton.textContent;
        checkButton.textContent = 'Checking...';
        checkButton.disabled = true;
        
        try {
          const response = await apiService.post('/check-answer', {
            questionId,
            userAnswer,
            correctAnswer,
            type: 'short-answer'
          });
          
          if (response.success) {
            const { similarity, feedback } = response.data;
            
            // Update feedback element
            const feedbackElement = question.querySelector('.quiz-feedback');
            if (feedbackElement) {
              feedbackElement.innerHTML = `
                <p><strong>Match Score:</strong> ${similarity}%</p>
                <p><strong>Feedback:</strong> ${feedback || 'Your answer was processed.'}</p>
                <p><strong>Suggested Answer:</strong> ${correctAnswer}</p>
              `;
              (feedbackElement as HTMLElement).style.display = 'block';
              
              // Add color based on score
              if (similarity >= 70) {
                feedbackElement.className = 'quiz-feedback correct-feedback p-3 bg-green-50 border border-green-200 rounded-md mt-3';
              } else {
                feedbackElement.className = 'quiz-feedback incorrect-feedback p-3 bg-amber-50 border border-amber-200 rounded-md mt-3';
              }
            }
          }
        } catch (error) {
          console.error('Error checking answer:', error);
          toast.error('Error checking answer. Please try again.');
        } finally {
          // Restore button
          checkButton.textContent = originalText;
          checkButton.disabled = false;
        }
      }
    } catch (error) {
      console.error('Error checking individual answer:', error);
    }
  }
};

export default ShortAnswerQuestions;