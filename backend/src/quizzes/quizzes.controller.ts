import type { Request, Response } from 'express';
import { createQuizSchema } from './quizzes.schema.js';
import { createQuiz } from './quizzes.service.js';

export async function createQuizHandler(request: Request, response: Response) {
  const input = createQuizSchema.parse(request.body);
  const quiz = await createQuiz(input);
  response.status(201).json(quiz);
}
