import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { quizzesRouter } from './quizzes/quizzes.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/quizzes', quizzesRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

app.use(errorHandler);
