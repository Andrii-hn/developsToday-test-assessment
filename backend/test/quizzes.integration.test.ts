import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { after, before, test } from 'node:test';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import type { QuizDetails } from '../src/quizzes/quizzes.mapper.js';
import { createQuiz } from '../src/quizzes/quizzes.service.js';
import { makeQuizInput } from './fixtures.js';

const titlePrefix = `test-${randomUUID()}`;
let server: Server | undefined;
let baseUrl: string;
let databaseReady = false;

before(async () => {
  execFileSync('npm', ['run', 'db:deploy'], { timeout: 30000, stdio: 'pipe' });
  databaseReady = true;
  const testServer = app.listen(0, '127.0.0.1');
  server = testServer;
  await once(testServer, 'listening');
  const address = testServer.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  try {
    if (server) {
      const testServer = server;
      await new Promise<void>((resolve, reject) => {
        testServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (databaseReady) {
      await prisma.quiz.deleteMany({
        where: { title: { startsWith: titlePrefix } },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

function postQuiz(body: unknown) {
  return fetch(`${baseUrl}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('creates and persists all question types in request order', async () => {
  const response = await postQuiz(makeQuizInput(` ${titlePrefix}-mixed `));
  assert.equal(response.status, 201);
  const quiz = (await response.json()) as QuizDetails;
  assert.match(quiz.id, /^[0-9a-f-]{36}$/);
  assert.equal(quiz.title, `${titlePrefix}-mixed`);
  assert.ok(!Number.isNaN(Date.parse(quiz.createdAt)));
  assert.deepEqual(
    quiz.questions.map((question) => question.type),
    ['BOOLEAN', 'INPUT', 'CHECKBOX'],
  );
  const [booleanQuestion, inputQuestion, checkboxQuestion] = quiz.questions;
  assert.ok(booleanQuestion?.type === 'BOOLEAN');
  assert.equal(booleanQuestion.correctAnswer, false);
  assert.ok(inputQuestion?.type === 'INPUT');
  assert.equal(inputQuestion.correctAnswer, 'const');
  assert.ok(checkboxQuestion?.type === 'CHECKBOX');
  assert.deepEqual(
    checkboxQuestion.options.map((option) => [option.text, option.isCorrect]),
    [
      ['string', true],
      ['boolean', true],
      ['array', false],
    ],
  );
  for (const question of quiz.questions) {
    for (const internalField of [
      'quizId',
      'position',
      'booleanAnswer',
      'textAnswer',
    ]) {
      assert.equal(internalField in question, false);
    }
  }
  const firstOption = checkboxQuestion.options[0];
  assert.ok(firstOption);
  assert.equal('questionId' in firstOption, false);

  const stored = await prisma.quiz.findUniqueOrThrow({
    where: { id: quiz.id },
    include: {
      questions: {
        orderBy: { position: 'asc' },
        include: { options: { orderBy: { position: 'asc' } } },
      },
    },
  });
  assert.deepEqual(
    stored.questions.map((question) => question.id),
    quiz.questions.map((question) => question.id),
  );
  assert.equal(stored.questions[0]?.booleanAnswer, false);
  assert.equal(stored.questions[0]?.text, 'Arrays are primitive values.');
  assert.equal(stored.questions[1]?.textAnswer, 'const');
  assert.deepEqual(
    stored.questions[2]?.options.map((option) => option.id),
    checkboxQuestion.options.map((option) => option.id),
  );
});

test('returns field errors and does not save invalid input', async () => {
  const response = await postQuiz({
    title: `${titlePrefix}-invalid`,
    questions: [{ type: 'BOOLEAN', text: ' ', correctAnswer: 'false' }],
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.deepEqual(
    body.error.fields.map((field: { path: string }) => field.path),
    ['questions.0.text', 'questions.0.correctAnswer'],
  );
  assert.equal(
    await prisma.quiz.count({ where: { title: `${titlePrefix}-invalid` } }),
    0,
  );
});

test('allows different quizzes to have the same title', async () => {
  const input = {
    title: `${titlePrefix}-duplicate-title`,
    questions: [{ type: 'BOOLEAN', text: 'Question', correctAnswer: true }],
  };
  const first = await postQuiz(input);
  const second = await postQuiz(input);
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual((await first.json()).id, (await second.json()).id);
});

test('returns JSON errors for malformed and oversized request bodies', async () => {
  const malformed = await fetch(`${baseUrl}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"title":',
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON');
  const oversized = await postQuiz({ title: 'x'.repeat(1024 * 1024) });
  assert.equal(oversized.status, 413);
  assert.equal((await oversized.json()).error.code, 'PAYLOAD_TOO_LARGE');
});

test('rolls back a nested write when the database rejects one question', async () => {
  const input = makeQuizInput(`${titlePrefix}-rollback`);
  const question = input.questions[1];
  assert.ok(question);
  question.text = 'x'.repeat(1001);
  await assert.rejects(createQuiz(input), { code: 'P2000' });
  assert.equal(await prisma.quiz.count({ where: { title: input.title } }), 0);
});

test('deleting a persisted quiz cascades to its questions and options', async () => {
  const response = await postQuiz(makeQuizInput(`${titlePrefix}-cascade`));
  assert.equal(response.status, 201);
  const quiz = (await response.json()) as QuizDetails;
  const questionIds = quiz.questions.map((question) => question.id);
  await prisma.quiz.delete({ where: { id: quiz.id } });
  assert.equal(
    await prisma.question.count({ where: { id: { in: questionIds } } }),
    0,
  );
  assert.equal(
    await prisma.option.count({ where: { questionId: { in: questionIds } } }),
    0,
  );
});
