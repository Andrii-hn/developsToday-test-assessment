import { Router } from 'express';
import {
  createQuizHandler,
  deleteQuizHandler,
  getQuizHandler,
  listQuizzesHandler,
} from './quizzes.controller.js';

export const quizzesRouter = Router();

quizzesRouter.post('/', createQuizHandler);
quizzesRouter.get('/', listQuizzesHandler);
quizzesRouter.get('/:id', getQuizHandler);
quizzesRouter.delete('/:id', deleteQuizHandler);
