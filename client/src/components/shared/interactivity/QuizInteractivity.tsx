const QuizInteractivity = {
  initialize: () => {
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
      if (button.closest('.short-answer-question')) {
        return;
      }
      
      button.addEventListener('click', function(this: Element) {
        const quizId = this.getAttribute('data-quiz-id');
        if (quizId) {
          console.log(`Checking answers for quiz: ${quizId}`);
          QuizInteractivity.checkQuizAnswers(quizId);
        }
      });
    });
    
    // Hide all feedback and results containers initially
    document.querySelectorAll('.quiz-feedback, .quiz-results').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    
    console.log('Quiz setup complete');
  },

  checkQuizAnswers: (quizId: string) => {
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
  }
};

export default QuizInteractivity;