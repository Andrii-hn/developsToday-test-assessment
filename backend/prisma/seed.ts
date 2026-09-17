import { prisma } from '../src/lib/prisma.js';

async function main() {
  const quiz = await prisma.quiz.upsert({
    where: { id: '36c4be25-e61b-4f06-86e5-353386a2a1b8' },
    update: {},
    create: {
      id: '36c4be25-e61b-4f06-86e5-353386a2a1b8',
      title: 'JavaScript basics',
      questions: {
        create: [
          {
            text: 'JavaScript arrays are primitive values.',
            type: 'BOOLEAN',
            position: 0,
            booleanAnswer: false,
          },
          {
            text: 'Which keyword declares a constant?',
            type: 'INPUT',
            position: 1,
            textAnswer: 'const',
          },
          {
            text: 'Which are JavaScript primitive types?',
            type: 'CHECKBOX',
            position: 2,
            options: {
              create: [
                { text: 'string', isCorrect: true, position: 0 },
                { text: 'boolean', isCorrect: true, position: 1 },
                { text: 'array', isCorrect: false, position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Sample quiz is ready: ${quiz.title} (${quiz.id})`);
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed the database.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
