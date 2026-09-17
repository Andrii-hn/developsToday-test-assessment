import { prisma } from '../lib/prisma.js';
import { quizDetailsInclude, toQuizDetails } from './quizzes.mapper.js';
import type { CreateQuizInput } from './quizzes.schema.js';

export async function createQuiz(input: CreateQuizInput) {
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      questions: {
        create: input.questions.map((question, position) => {
          const base = { text: question.text, type: question.type, position };

          switch (question.type) {
            case 'BOOLEAN':
              return { ...base, booleanAnswer: question.correctAnswer };
            case 'INPUT':
              return { ...base, textAnswer: question.correctAnswer };
            case 'CHECKBOX':
              return {
                ...base,
                options: {
                  create: question.options.map((option, optionPosition) => ({
                    ...option,
                    position: optionPosition,
                  })),
                },
              };
          }
        }),
      },
    },
    include: quizDetailsInclude,
  });

  return toQuizDetails(quiz);
}
