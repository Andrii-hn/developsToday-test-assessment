import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createQuizSchema } from '../src/quizzes/quizzes.schema.js';
import { makeQuizInput } from './fixtures.js';

test('trims all text and preserves false and multiple correct answers', () => {
  const parsed = createQuizSchema.parse(makeQuizInput());
  assert.deepEqual(parsed, {
    title: 'JavaScript basics',
    questions: [
      {
        type: 'BOOLEAN',
        text: 'Arrays are primitive values.',
        correctAnswer: false,
      },
      {
        type: 'INPUT',
        text: 'Which keyword declares a constant?',
        correctAnswer: 'const',
      },
      {
        type: 'CHECKBOX',
        text: 'Which are primitive types?',
        options: [
          { text: 'string', isCorrect: true },
          { text: 'boolean', isCorrect: true },
          { text: 'array', isCorrect: false },
        ],
      },
    ],
  });
});

const booleanQuestion = {
  type: 'BOOLEAN',
  text: 'True or false?',
  correctAnswer: false,
};
const validOptions = [
  { text: 'A', isCorrect: true },
  { text: 'B', isCorrect: false },
];
const invalidQuestions: [string, unknown][] = [
  ['unsupported type', { ...booleanQuestion, type: 'RADIO' }],
  ['missing Boolean answer', { type: 'BOOLEAN', text: 'Question' }],
  ['string Boolean answer', { ...booleanQuestion, correctAnswer: 'false' }],
  ['null Boolean answer', { ...booleanQuestion, correctAnswer: null }],
  ['blank question', { ...booleanQuestion, text: ' \n ' }],
  [
    'question over 1000 characters',
    { ...booleanQuestion, text: 'x'.repeat(1001) },
  ],
  ['Boolean with options', { ...booleanQuestion, options: validOptions }],
  [
    'blank text answer',
    { type: 'INPUT', text: 'Question', correctAnswer: '  ' },
  ],
  [
    'non-text input answer',
    { type: 'INPUT', text: 'Question', correctAnswer: 1 },
  ],
  [
    'text answer over 500 characters',
    { type: 'INPUT', text: 'Question', correctAnswer: 'x'.repeat(501) },
  ],
  [
    'one checkbox option',
    { type: 'CHECKBOX', text: 'Question', options: [validOptions[0]] },
  ],
  [
    'more than 20 options',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: Array.from({ length: 21 }, (_, index) => ({
        text: `Option ${index}`,
        isCorrect: true,
      })),
    },
  ],
  [
    'no correct options',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: validOptions.map((option) => ({ ...option, isCorrect: false })),
    },
  ],
  [
    'duplicate labels after trimming and case folding',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: [
        { text: ' Yes ', isCorrect: true },
        { text: 'yes', isCorrect: false },
      ],
    },
  ],
  [
    'blank option',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: [validOptions[0], { text: ' ', isCorrect: false }],
    },
  ],
  [
    'option over 300 characters',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: [validOptions[0], { text: 'x'.repeat(301), isCorrect: false }],
    },
  ],
  [
    'non-Boolean correct marker',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: [validOptions[0], { text: 'B', isCorrect: 'false' }],
    },
  ],
  [
    'checkbox with a scalar answer',
    {
      type: 'CHECKBOX',
      text: 'Question',
      options: validOptions,
      correctAnswer: 'A',
    },
  ],
  ['client-assigned position', { ...booleanQuestion, position: 4 }],
];

for (const [name, question] of invalidQuestions) {
  test(`rejects ${name}`, () => {
    const result = createQuizSchema.safeParse({
      title: 'Quiz',
      questions: [question],
    });
    assert.equal(result.success, false);
  });
}

test('rejects invalid quiz titles, question counts, and unknown top-level fields', () => {
  const inputs = [
    undefined,
    { title: ' ', questions: [booleanQuestion] },
    { title: 'x'.repeat(121), questions: [booleanQuestion] },
    { title: 'Quiz', questions: [] },
    {
      title: 'Quiz',
      questions: Array.from({ length: 51 }, () => booleanQuestion),
    },
    { title: 'Quiz', questions: [booleanQuestion], id: 'client-assigned-id' },
  ];
  for (const input of inputs) {
    assert.equal(createQuizSchema.safeParse(input).success, false);
  }
});

test('accepts the maximum lengths and counts', () => {
  const question = {
    type: 'INPUT',
    text: 'x'.repeat(1000),
    correctAnswer: 'x'.repeat(500),
  };
  const questions = Array.from({ length: 49 }, () => question);
  const result = createQuizSchema.safeParse({
    title: 'x'.repeat(120),
    questions: [
      ...questions,
      {
        type: 'CHECKBOX',
        text: 'Choose',
        options: Array.from({ length: 20 }, (_, index) => ({
          text: String(index).padEnd(300, 'x'),
          isCorrect: index === 0,
        })),
      },
    ],
  });
  assert.equal(result.success, true);
});

test('reports the nested field for a duplicate option', () => {
  const result = createQuizSchema.safeParse({
    title: 'Quiz',
    questions: [
      {
        type: 'CHECKBOX',
        text: 'Choose',
        options: [validOptions[0], validOptions[0]],
      },
    ],
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.error.issues[0]?.path, [
      'questions',
      0,
      'options',
      1,
      'text',
    ]);
  }
});
