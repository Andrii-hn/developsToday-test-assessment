import type { CreateQuizInput } from '../src/quizzes/quizzes.schema.js';

export function makeQuizInput(title = ' JavaScript basics '): CreateQuizInput {
  return {
    title,
    questions: [
      {
        type: 'BOOLEAN',
        text: ' Arrays are primitive values. ',
        correctAnswer: false,
      },
      {
        type: 'INPUT',
        text: ' Which keyword declares a constant? ',
        correctAnswer: ' const ',
      },
      {
        type: 'CHECKBOX',
        text: ' Which are primitive types? ',
        options: [
          { text: ' string ', isCorrect: true },
          { text: ' boolean ', isCorrect: true },
          { text: ' array ', isCorrect: false },
        ],
      },
    ],
  };
}
