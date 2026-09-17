import type { Request, Response } from 'express';
import { createQuizSchema, quizIdParamsSchema } from './quizzes.schema.js';
import {
  createQuiz,
  deleteQuiz,
  getQuiz,
  listQuizzes,
} from './quizzes.service.js';

const quizNotFound = {
  error: { code: 'NOT_FOUND', message: 'Quiz not found.' },
};

export async function listQuizzesHandler(
  _request: Request,
  response: Response,
) {
  response.json(await listQuizzes());
}

export async function getQuizHandler(request: Request, response: Response) {
  const { id } = quizIdParamsSchema.parse(request.params);
  const quiz = await getQuiz(id);
  if (!quiz) {
    response.status(404).json(quizNotFound);
    return;
  }
  response.json(quiz);
}

export async function deleteQuizHandler(request: Request, response: Response) {
  const { id } = quizIdParamsSchema.parse(request.params);
  if (!(await deleteQuiz(id))) {
    response.status(404).json(quizNotFound);
    return;
  }
  response.status(204).end();
}

export async function createQuizHandler(request: Request, response: Response) {
  const input = createQuizSchema.parse(request.body);
  const quiz = await createQuiz(input);
  response.status(201).json(quiz);
}
