import type { Prisma } from '../generated/prisma/client.js';

export const quizDetailsInclude = {
  questions: {
    orderBy: { position: 'asc' },
    include: { options: { orderBy: { position: 'asc' } } },
  },
} satisfies Prisma.QuizInclude;

type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: typeof quizDetailsInclude;
}>;

export function toQuizDetails(quiz: QuizWithQuestions) {
  return {
    id: quiz.id,
    title: quiz.title,
    createdAt: quiz.createdAt.toISOString(),
    questions: quiz.questions.map((question) => {
      const base = { id: question.id, text: question.text };

      switch (question.type) {
        case 'BOOLEAN':
          if (question.booleanAnswer === null) {
            throw new Error('A stored Boolean question is missing its answer.');
          }
          return {
            ...base,
            type: question.type,
            correctAnswer: question.booleanAnswer,
          };
        case 'INPUT':
          if (question.textAnswer === null) {
            throw new Error('A stored input question is missing its answer.');
          }
          return {
            ...base,
            type: question.type,
            correctAnswer: question.textAnswer,
          };
        case 'CHECKBOX':
          return {
            ...base,
            type: question.type,
            options: question.options.map((option) => ({
              id: option.id,
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          };
      }
    }),
  };
}

export type QuizDetails = ReturnType<typeof toQuizDetails>;
