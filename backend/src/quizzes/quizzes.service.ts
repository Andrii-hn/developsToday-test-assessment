import { prisma } from '../lib/prisma.js';
import { quizDetailsInclude, toQuizDetails } from './quizzes.mapper.js';
import type { CreateQuizInput } from './quizzes.schema.js';

export async function listQuizzes() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, title: true, _count: { select: { questions: true } } },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    questionCount: quiz._count.questions,
  }));
}

export async function getQuiz(id: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: quizDetailsInclude,
  });
  return quiz ? toQuizDetails(quiz) : null;
}

export async function deleteQuiz(id: string) {
  const result = await prisma.quiz.deleteMany({ where: { id } });
  return result.count > 0;
}

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
