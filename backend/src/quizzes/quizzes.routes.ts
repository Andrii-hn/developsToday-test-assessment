import { Router } from 'express';
import { createQuizHandler } from './quizzes.controller.js';

export const quizzesRouter = Router();

quizzesRouter.post('/', createQuizHandler);
