interface QuizQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
}

interface FlipCard {
  id: number;
  front: string;
  back: string;
}

interface QuizResponse {
  quizTitle: string;
  quizType: string;
  instructions?: string;
  questions?: QuizQuestion[];
  cards?: FlipCard[];
}

interface RegenerateQuestionOptions {
  chapterContent: string;
  quizType: QuizType;
  questionIndex: number;
  apiResponse: any; // Replace with your actual API response type
}


// Add these types
export type QuizType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'flip-card' | 'short-answer';

interface QuestionRegenerateResponse {
  editorQuizHTML: string;
  sharedQuizHTML: string;
}


export const regenerateQuizQuestion = async (
  content: string,
  currentQuiz: { editorContent: string; sharedContent: string },
  questionIndex: number
): Promise<QuestionRegenerateResponse> => {
  // Extract quiz type from current quiz
  const quizType = determineQuizType(currentQuiz.sharedContent);
  
  // Parse the current quiz structure
  const parser = new DOMParser();
  const editorDoc = parser.parseFromString(currentQuiz.editorContent, 'text/html');
  const sharedDoc = parser.parseFromString(currentQuiz.sharedContent, 'text/html');
  
  // Get all questions
  const editorQuestions = Array.from(editorDoc.querySelectorAll('.quiz-question'));
  const sharedQuestions = Array.from(sharedDoc.querySelectorAll('.quiz-question'));
  
  if (questionIndex >= editorQuestions.length) {
    throw new Error('Question index out of bounds');
  }

  // Extract quiz metadata
  const quizContainer = sharedDoc.querySelector('.quiz-container');
  const existingQuizId = quizContainer?.id || `quiz-${Date.now()}`;
  const quizTitle = quizContainer?.querySelector('.quiz-title')?.textContent || '';
  
  try {
    // Create a temporary div to hold the new question
    const newQuestionDoc = parser.parseFromString(content, 'text/html');
    const newQuestion = newQuestionDoc.querySelector('.quiz-question');
    
    if (!newQuestion) {
      throw new Error('Invalid question format');
    }

    // Replace the old question with the new one
    editorQuestions[questionIndex].replaceWith(newQuestion.cloneNode(true));
    sharedQuestions[questionIndex].replaceWith(newQuestion.cloneNode(true));

    // Reconstruct the quiz HTML
    const editorQuizHTML = editorDoc.documentElement.outerHTML;
    const sharedQuizHTML = sharedDoc.documentElement.outerHTML;

    return {
      editorQuizHTML,
      sharedQuizHTML
    };
  } catch (error) {
    console.error('Error regenerating question:', error);
    throw new Error('Failed to regenerate question');
  }
};

export const determineQuizType = (quizContent: string): QuizType => {
  if (quizContent.includes('flash-card')) return 'flip-card';
  if (quizContent.includes('true-false')) return 'true-false';
  if (quizContent.includes('fill-blank')) return 'fill-in-the-blank';
  if (quizContent.includes('short-answer')) return 'short-answer';
  return 'multiple-choice'; // default
};

export const formatQuizHTML = (quizData: QuizResponse & { 
  existingQuiz?: { editorContent: string; sharedContent: string };
  replaceQuestionIndex?: number;
}): { editorQuizHTML: string; sharedQuizHTML: string } => {
  const parser = new DOMParser();
  
  // Handle single question regeneration
  if (quizData.existingQuiz && typeof quizData.replaceQuestionIndex === 'number') {
    try {
      // Parse existing content
      const editorDoc = parser.parseFromString(quizData.existingQuiz.editorContent, 'text/html');
      const sharedDoc = parser.parseFromString(quizData.existingQuiz.sharedContent, 'text/html');
      
      if (quizData.questions && quizData.questions.length === 1) {
        // Get the quiz container and its ID
        const quizContainer = sharedDoc.querySelector('.quiz-container');
        const quizId = quizContainer?.id || `quiz-${Date.now()}`;
        const quizType = quizContainer?.getAttribute('data-quiz-type') as QuizType;

        // Format only the new question
        const { editor: newEditorQuestion, shared: newSharedQuestion } = formatQuestion(
          quizData.questions[0],
          quizData.replaceQuestionIndex,
          quizId,
          quizType || quizData.quizType
        );

        // Find the questions to replace
        const editorTarget = editorDoc.querySelectorAll('.quiz-question')[quizData.replaceQuestionIndex];
        const sharedTarget = sharedDoc.querySelectorAll('.quiz-question')[quizData.replaceQuestionIndex];

        if (editorTarget && sharedTarget) {
          // Create temporary elements to parse the new question HTML
          const tempEditor = parser.parseFromString(newEditorQuestion, 'text/html');
          const tempShared = parser.parseFromString(newSharedQuestion, 'text/html');

          // Replace only the question content
          const newEditorContent = tempEditor.querySelector('.quiz-question');
          const newSharedContent = tempShared.querySelector('.quiz-question');

          if (newEditorContent && newSharedContent) {
            editorTarget.replaceWith(newEditorContent);
            sharedTarget.replaceWith(newSharedContent);
          }
        }

        // Return the updated content while preserving structure
        return {
          editorQuizHTML: editorDoc.body.innerHTML,
          sharedQuizHTML: sharedDoc.body.innerHTML
        };
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      throw new Error('Failed to regenerate question');
    }
  }

  // Regular full quiz generation code remains unchanged...
  const quizId = `quiz-${Date.now()}`;
  
  let editorQuizHTML = `<h2>Exercises</h2>`;
  let sharedQuizHTML = `<h2>Exercises</h2>`;

  if (quizData.quizTitle) {
    editorQuizHTML += `<h3 style="font-weight: 600; margin-bottom: 16px;">${quizData.quizTitle}</h3>`;
    sharedQuizHTML += `<h3 style="font-weight: 600; margin-bottom: 16px;">${quizData.quizTitle}</h3>`;
  }

  if (quizData.instructions) {
    editorQuizHTML += `<p style="margin-bottom: 16px; font-style: italic;">${quizData.instructions}</p>`;
    sharedQuizHTML += `<p style="margin-bottom: 16px; font-style: italic;">${quizData.instructions}</p>`;
  }

  editorQuizHTML += `<!-- quiz data: id="${quizId}" type="${quizData.quizType}" -->`;
  sharedQuizHTML += `<div class="quiz-container" id="${quizId}" data-quiz-type="${quizData.quizType}" data-quiz-title="${quizData.quizTitle}">`;

  if (quizData.quizType === 'flip-card' && quizData.cards) {
    // Format flip cards
    editorQuizHTML += formatFlipCardsEditor(quizData.cards);
    sharedQuizHTML += formatFlipCardsShared(quizData.cards, quizId);
  } else if (quizData.questions) {
    // Format other quiz types
    quizData.questions.forEach((question, index) => {
      const { editor, shared } = formatQuestion(question, index, quizId, quizData.quizType);
      editorQuizHTML += editor;
      sharedQuizHTML += shared;
    });

    // Add controls and results for non-flip-card quizzes
    if (quizData.quizType !== 'flip-card') {
      sharedQuizHTML += formatQuizControls(quizId, quizData.questions.length);
    }
  }

  sharedQuizHTML += `</div>`;

  return { editorQuizHTML, sharedQuizHTML };
};

function formatFlipCardsEditor(cards: FlipCard[]): string {
  let html = `<div class="flash-cards-preview">`;
  cards.forEach((card, index) => {
    html += `
      <div class="flash-card-preview" style="margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #f9fafb; padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <h4 style="font-weight: bold; margin: 0;">Card ${index + 1}</h4>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px;">
          <div style="padding: 12px; background-color: #f9fafb; border-radius: 4px;">
            <p style="font-weight: 500;">Front:</p>
            <p>${card.front}</p>
          </div>
          <div style="padding: 12px; background-color: #f0f7ff; border-radius: 4px;">
            <p style="font-weight: 500;">Back:</p>
            <p>${card.back}</p>
          </div>
        </div>
      </div>
    `;
  });
  return html + `</div>`;
}

function formatFlipCardsShared(cards: FlipCard[], quizId: string): string {
  let html = `<div class="flash-cards-grid">`;
  cards.forEach((card, index) => {
    html += `
      <div class="flash-card" id="${quizId}-card${index}" data-card-id="${card.id}">
        <div class="flash-card-inner">
          <div class="flash-card-front">
            <p>${card.front}</p>
          </div>
          <div class="flash-card-back">
            <p>${card.back}</p>
          </div>
        </div>
      </div>
    `;
  });
  return html + `</div>`;
}

function formatQuestion(question: QuizQuestion, index: number, quizId: string, quizType: string): { editor: string, shared: string } {
  let editorHtml = `<p style="font-weight: bold; margin-top: 20px;">Question ${index + 1}: ${question.question}</p>`;
  let sharedHtml = `<div class="quiz-question" id="${quizId}-q${index}" data-question-id="${question.id}" data-correct-answer="${question.correctAnswer}">
    <p style="font-weight: bold; margin-top: 20px;">Question ${index + 1}: ${question.question}</p>`;

  if (quizType === 'short-answer') {
    return formatShortAnswer(question, editorHtml, sharedHtml);
  } else if (question.options && (quizType === 'multiple-choice' || quizType === 'true-false')) {
    return formatMultipleChoice(question, editorHtml, sharedHtml);
  } else if (quizType === 'fill-in-the-blank') {
    return formatFillInBlank(question, editorHtml, sharedHtml);
  }

  return { editor: editorHtml, shared: sharedHtml + '</div>' };
}

function formatQuizControls(quizId: string, totalQuestions: number): string {
  return `
    <div class="quiz-controls" style="margin-top: 20px;">
      <button type="button" class="quiz-submit-btn" data-quiz-id="${quizId}" style="background-color: #4338ca; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        Check Answers
      </button>
    </div>
    <div class="quiz-results" style="display: none; margin-top: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h4 style="margin-bottom: 10px;">Quiz Results</h4>
      <p class="quiz-score">You scored: <span class="score-value">0</span>/<span class="total-questions">${totalQuestions}</span></p>
    </div>
  `;
}

// Helper formatting functions for different question types
function formatShortAnswer(question: QuizQuestion, editorHtml: string, sharedHtml: string): { editor: string, shared: string } {
  editorHtml += `<p style="margin: 10px 0;">Answer: ${question.correctAnswer}</p>`;
  sharedHtml += `
    <div style="margin: 10px 0;">
      <textarea class="short-answer-field" placeholder="Type your answer here" style="width: 100%; min-height: 100px; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; resize: vertical;"></textarea>
    </div>
    <div class="quiz-feedback correct-feedback" style="display: none; margin-top: 10px; padding: 8px 12px; background-color: #d1fae5; border-radius: 4px; color: #065f46;">
      <p><strong>Suggested Answer:</strong> ${question.correctAnswer}</p>
      <p>${question.explanation || ''}</p>
    </div>
  </div>`;
  return { editor: editorHtml, shared: sharedHtml };
}

function formatMultipleChoice(question: QuizQuestion, editorHtml: string, sharedHtml: string): { editor: string, shared: string } {
  editorHtml += '<ul style="list-style-type: upper-alpha; padding-left: 20px; margin: 10px 0;">';
  sharedHtml += '<ul style="list-style-type: none; padding-left: 0; margin: 10px 0;">';

  Object.entries(question.options).forEach(([key, option]) => {
    editorHtml += `<li style="margin-bottom: 5px;">${option}</li>`;
    sharedHtml += `<li style="margin-bottom: 8px; display: flex; align-items: center;">
      <div class="circle-marker" data-option="${key}" style="display: inline-block; width: 18px; height: 18px; border: 1px solid #ccc; border-radius: 50%; margin-right: 8px;"></div>
      <span><strong>${key}.</strong> ${option}</span>
    </li>`;
  });

  editorHtml += '</ul>';
  sharedHtml += `</ul>
    <div class="quiz-feedback correct-feedback" style="display: none; margin-top: 10px; padding: 8px 12px; background-color: #d1fae5; border-radius: 4px; color: #065f46;">
      <p><strong>Correct!</strong> ${question.explanation || ''}</p>
    </div>
    <div class="quiz-feedback incorrect-feedback" style="display: none; margin-top: 10px; padding: 8px 12px; background-color: #fee2e2; border-radius: 4px; color: #7f1d1d;">
      <p><strong>Incorrect.</strong> The correct answer is ${question.correctAnswer}. ${question.explanation || ''}</p>
    </div>
  </div>`;

  return { editor: editorHtml, shared: sharedHtml };
}

function formatFillInBlank(question: QuizQuestion, editorHtml: string, sharedHtml: string): { editor: string, shared: string } {
  editorHtml += `<p style="margin: 10px 0;">Answer: <span style="text-decoration: underline; padding: 0 30px;">&nbsp;</span></p>`;
  sharedHtml += `<div style="margin: 10px 0;">
    <input type="text" placeholder="Type your answer here" class="quiz-answer-field" style="border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 4px; width: 100%; max-width: 300px;" />
  </div></div>`;
  return { editor: editorHtml, shared: sharedHtml };
}