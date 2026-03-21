export const AI_CONFIG = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
  },
  prompts: {
    courseOutline: (topic: string) => `
      Create a detailed course outline for learning: "${topic}"
      
      Requirements:
      - Include 5-8 modules
      - Each module should have 3-5 lessons
      - Structure: Module > Lesson hierarchy
      - Include practical examples
      - Focus on beginner to intermediate level
      
      Output format (JSON):
      {
        "title": "Course Title",
        "description": "Course description",
        "modules": [
          {
            "title": "Module Title",
            "order": 1,
            "lessons": [
              {
                "title": "Lesson Title",
                "order": 1,
                "description": "Lesson description"
              }
            ]
          }
        ]
      }
    `,
    lessonContent: (moduleTitle: string, lessonTitle: string, description: string) => `
      Create detailed content for: ${moduleTitle} > ${lessonTitle}
      
      Description: ${description}
      
      Requirements:
      - Comprehensive explanation
      - Code examples (if applicable)
      - Best practices
      - Common pitfalls
      
      Output format (JSON):
      {
        "content": "Markdown content with examples",
        "duration": 15, // in minutes
        "keyPoints": ["point1", "point2", "point3"]
      }
    `,
    quiz: (lessonContent: string, lessonTitle: string) => `
      Create a quiz for the lesson: "${lessonTitle}"
      
      Lesson content: ${lessonContent}
      
      Requirements:
      - Generate 5-10 questions
      - Include multiple choice questions (MCQ) and true/false questions
      - Each question should have 4 options for MCQ
      - Mark the correct answer for each question
      - Include explanations for each answer
      
      Output format (JSON):
      {
        "title": "Quiz for ${lessonTitle}",
        "description": "Test your understanding of ${lessonTitle}",
        "questions": [
          {
            "type": "mcq", // or "true_false"
            "text": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A", // or index 0
            "explanation": "Explanation for why this is correct"
          }
        ]
      }
    `,
    flashcards: (lessonContent: string, lessonTitle: string) => `
      Create flashcards for the lesson: "${lessonTitle}"
      
      Lesson content: ${lessonContent}
      
      Requirements:
      - Generate 5-10 flashcards
      - Each flashcard should have a front (question/prompt) and back (answer)
      - Focus on key concepts, definitions, and important facts
      
      Output format (JSON):
      {
        "title": "Flashcards for ${lessonTitle}",
        "flashcards": [
          {
            "front": "Question or concept",
            "back": "Answer or explanation"
          }
        ]
      }
    `,
  },
};
