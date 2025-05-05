const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

const generateQuiz = async (data) => {
    try {
        // Extract request data
        const { chapterContent, quizType, questionCount } = data;
        
        // Set default question count if not provided
        const numQuestions = questionCount || 5;
        
        // Create prompt based on quiz type
        let prompt = `Based on the following chapter content, generate a clean, structured quiz with ${numQuestions} questions.`;
        
        if (quizType === 'multiple-choice') {
            prompt += ` Each question should have 4 options (A, B, C, D) with one correct answer. Format the quiz in JSON as follows:
            {
                "quizTitle": "Quiz on [Topic from Content]",
                "quizType": "multiple-choice",
                "questions": [
                    {
                        "id": 1,
                        "question": "Question text here?",
                        "options": {
                            "A": "First option",
                            "B": "Second option",
                            "C": "Third option",
                            "D": "Fourth option"
                        },
                        "correctAnswer": "A",
                        "explanation": "Brief explanation of the correct answer"
                    }
                ]
            }
            
            Ensure there are exactly ${numQuestions} questions, with no bullet points, no extra formatting characters, and clean text that will render properly in HTML.`;
        } else if (quizType === 'true-false') {
            prompt += ` Each question should be a true/false statement. Format the quiz in JSON as follows:
            {
                "quizTitle": "True/False Quiz on [Topic from Content]",
                "quizType": "true-false",
                "questions": [
                    {
                        "id": 1,
                        "question": "Statement that is either true or false",
                        "options": {
                            "A": "True",
                            "B": "False"
                        },
                        "correctAnswer": "A",
                        "explanation": "Brief explanation of why this statement is true/false"
                    }
                ]
            }
            
            Ensure there are exactly ${numQuestions} questions, with no bullet points, no extra formatting characters, and clean text that will render properly in HTML.`;
        } else if (quizType === 'fill-in-the-blank') {
            prompt += ` Each question should be a sentence with a blank to fill in. Format the quiz in JSON as follows:
            {
                "quizTitle": "Fill-in-the-Blank Quiz on [Topic from Content]",
                "quizType": "fill-in-the-blank",
                "questions": [
                    {
                        "id": 1,
                        "question": "A sentence with a _____ to fill in.",
                        "correctAnswer": "word",
                        "explanation": "Brief explanation of why this answer is correct"
                    }
                ]
            }
            
            Ensure there are exactly ${numQuestions} questions, with no bullet points, no extra formatting characters, and clean text that will render properly in HTML.`;
        } else if (quizType === 'matching') {
            prompt += ` Create a matching exercise with terms and definitions. Format the quiz in JSON as follows:
            {
                "quizTitle": "Matching Quiz on [Topic from Content]",
                "quizType": "matching",
                "instructions": "Match each term with its correct definition",
                "terms": {
                    "A": "First term",
                    "B": "Second term",
                    "C": "Third term",
                    "D": "Fourth term",
                    "E": "Fifth term"
                },
                "definitions": {
                    "1": "Definition for term C",
                    "2": "Definition for term A",
                    "3": "Definition for term E",
                    "4": "Definition for term B",
                    "5": "Definition for term D"
                },
                "correctMatches": {
                    "A": "2",
                    "B": "4",
                    "C": "1",
                    "D": "5",
                    "E": "3"
                }
            }
            
            Make sure terms are simple nouns or short phrases, and definitions are clear sentences that will render properly in HTML without extra formatting characters.`;
        } else if (quizType === 'flip-card') {
            prompt += ` Create a set of flip cards with a term on the front and its definition on the back. Format the quiz in JSON as follows:
            {
                "quizTitle": "Flip Cards on [Topic from Content]",
                "quizType": "flip-card",
                "instructions": "Click each card to flip between the term and its definition",
                "cards": [
                    {
                        "id": 1,
                        "front": "Term or concept name",
                        "back": "Definition or explanation of the term"
                    }
                ]
            }
            
            Ensure there are exactly ${numQuestions} cards, with clear, concise terms on the front and detailed but brief definitions on the back. Avoid bullet points or special characters.`;
        } else if (quizType === 'short-answer') {
            prompt += ` Create short question and answer pairs. Format the quiz in JSON as follows:
            {
                "quizTitle": "Short Answer Quiz on [Topic from Content]",
                "quizType": "short-answer",
                "questions": [
                    {
                        "id": 1,
                        "question": "Concise question about a key concept?",
                        "correctAnswer": "Brief model answer that addresses the question",
                        "explanation": "Additional context or clarification about the answer"
                    }
                ]
            }
            
            Ensure there are exactly ${numQuestions} questions, with clear questions and concise model answers. Avoid bullet points, numbering, or special characters that might cause formatting issues.`;
        }
        
        prompt += `\n\nChapter content: ${chapterContent}\n\nReturn ONLY valid JSON with no extra text, markdown, or bullet points. The text must be clean and compatible with React Quill editor and PDF generation.`;
        
        // Generate quiz using OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system", 
                    content: "You are an educational quiz generator. Create professionally written questions that test understanding of key concepts from the provided content. Return ONLY valid JSON with clean text suitable for HTML rendering. Do not use bullet points, special characters, or formatting that might break in a text editor or PDF."
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.5, // Lower temperature for more predictable output
            max_tokens: 2500,
            response_format: { type: "json_object" }
        });

        // Extract and parse the response
        const quizResponse = response.choices[0].message.content.trim();
        
        try {
            // Parse the JSON
            let quizData = JSON.parse(quizResponse);
            
            // Sanitize the data to ensure it's clean
            quizData = sanitizeQuizData(quizData, quizType);
            
            return quizData;
            
        } catch (err) {
            console.error("Failed to parse quiz JSON:", err);
            
            // Try to extract just the JSON part if the AI included additional text
            try {
                const jsonMatch = quizResponse.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : quizResponse;
                const extractedData = JSON.parse(jsonString);
                return sanitizeQuizData(extractedData, quizType);
            } catch (extractError) {
                console.error("Failed to extract JSON:", extractError);
                return { 
                    error: "Generated quiz has invalid format", 
                    raw: quizResponse.substring(0, 200) + "..." // Return truncated response for debugging
                };
            }
        }

    } catch (error) {
        console.error("Quiz Generation Error:", error.message);
        return null;
    }
};

// Helper function to sanitize quiz data
const sanitizeQuizData = (data, quizType) => {
    // Clean up any potential issues in the quiz data
    try {
        // Special handling for flip cards
        if (quizType === 'flip-card') {
            const cards = data.cards || [];
            
            const cleanCards = cards.map((card, index) => {
                return {
                    id: index + 1,
                    front: card.front.replace(/•|–|—|\*|\-/g, '').trim(),
                    back: card.back.replace(/•|–|—|\*|\-/g, '').trim()
                };
            });
            
            return {
                quizTitle: data.quizTitle || "Flip Cards",
                quizType: "flip-card",
                instructions: data.instructions || "Click each card to flip between the term and its definition",
                cards: cleanCards
            };
        } 
        // Handle matching quiz specially
        else if (quizType === 'matching') {
            const matchingData = data.quiz || data;
            
            // Clean terms and definitions
            const terms = matchingData.terms || {};
            const definitions = matchingData.definitions || {};
            const cleanTerms = Object.fromEntries(
                Object.entries(terms).map(([key, value]) => 
                    [key, value.replace(/•|–|—|\*|\-/g, '').trim()]
                )
            );
            const cleanDefinitions = Object.fromEntries(
                Object.entries(definitions).map(([key, value]) => 
                    [key, value.replace(/•|–|—|\*|\-/g, '').trim()]
                )
            );
            
            return {
                quizTitle: data.quizTitle || "Matching Quiz",
                quizType: "matching",
                instructions: matchingData.instructions || "Match each term with its correct definition",
                terms: cleanTerms,
                definitions: cleanDefinitions,
                correctMatches: matchingData.correctMatches || {}
            };
        }
        // Handle all other question-based quiz types
        else {
            // Handle both quiz and questions array format
            let questions = data.questions || (data.quiz ? (Array.isArray(data.quiz) ? data.quiz : []) : []);
            
            // For question-based quizzes
            questions = questions.map((q, index) => {
                // Clean the question text
                const cleanQuestion = q.question.replace(/•|–|—|\*|\-/g, '').trim();
                
                // Clean options if they exist
                const cleanOptions = q.options ? 
                    Object.fromEntries(
                        Object.entries(q.options).map(([key, value]) => 
                            [key, value.replace(/•|–|—|\*|\-/g, '').trim()]
                        )
                    ) : undefined;
                
                // Clean explanation
                const cleanExplanation = q.explanation ? 
                    q.explanation.replace(/•|–|—|\*|\-/g, '').trim() : 
                    '';

                // Clean correctAnswer
                const cleanAnswer = q.correctAnswer ? 
                    q.correctAnswer.replace(/•|–|—|\*|\-/g, '').trim() : 
                    q.correctAnswer;
                
                return {
                    id: index + 1,
                    question: cleanQuestion,
                    ...(cleanOptions && { options: cleanOptions }),
                    correctAnswer: cleanAnswer,
                    explanation: cleanExplanation
                };
            });
            
            // Build standardized output
            return {
                quizTitle: data.quizTitle || `Quiz on ${quizType}`,
                quizType: quizType,
                questions: questions
            };
        }
    } catch (error) {
        console.error("Error sanitizing quiz data:", error);
        return data; // Return original data if sanitization fails
    }
};

module.exports = { generateQuiz };