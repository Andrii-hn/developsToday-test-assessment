import { z } from 'zod';

function requiredText(label: string, maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be at most ${maxLength} characters.`);
}

const questionText = requiredText('Question text', 1000);
const optionSchema = z.strictObject({
  text: requiredText('Option text', 300),
  isCorrect: z.boolean(),
});

const checkboxQuestionSchema = z
  .strictObject({
    type: z.literal('CHECKBOX'),
    text: questionText,
    options: z
      .array(optionSchema)
      .min(2, 'Add at least two options.')
      .max(20, 'A question can have at most 20 options.'),
  })
  .superRefine((question, context) => {
    if (!question.options.some((option) => option.isCorrect)) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Select at least one correct option.',
      });
    }

    const labels = new Set<string>();
    question.options.forEach((option, index) => {
      const label = option.text.toLowerCase();
      if (labels.has(label)) {
        context.addIssue({
          code: 'custom',
          path: ['options', index, 'text'],
          message: 'Option labels must be unique within a question.',
        });
      }
      labels.add(label);
    });
  });

const questionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('BOOLEAN'),
    text: questionText,
    correctAnswer: z
      .union([z.boolean(), z.literal('')])
      .pipe(z.boolean({ error: 'Select True or False.' })),
  }),
  z.strictObject({
    type: z.literal('INPUT'),
    text: questionText,
    correctAnswer: requiredText('Correct answer', 500),
  }),
  checkboxQuestionSchema,
]);

export const createQuizSchema = z.strictObject({
  title: requiredText('Quiz title', 120),
  questions: z
    .array(questionSchema)
    .min(1, 'Add at least one question.')
    .max(50, 'A quiz can have at most 50 questions.'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export type QuizFormValues = z.input<typeof createQuizSchema>;

export type QuestionType = QuizFormValues['questions'][number]['type'];

export function newQuestion(
  type: QuestionType,
  text = '',
): QuizFormValues['questions'][number] {
  if (type === 'CHECKBOX')
    return {
      type,
      text,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    };
  return { type, text, correctAnswer: '' };
}
