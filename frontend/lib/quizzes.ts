export type Question = { id: string; text: string } & (
  | { type: 'BOOLEAN'; correctAnswer: boolean }
  | { type: 'INPUT'; correctAnswer: string }
  | {
      type: 'CHECKBOX';
      options: { id: string; text: string; isCorrect: boolean }[];
    }
);

export type Quiz = {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
};

export type QuizSummary = { id: string; title: string; questionCount: number };

export const questionLabels = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}${path}`,
      {
        ...options,
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
        headers: {
          ...options?.headers,
          ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        },
      },
    );
  } catch {
    throw new ApiError('Unable to reach the server. Please try again.', 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const fields = Array.isArray(body?.error?.fields)
      ? body.error.fields.filter(
          (field: { path?: unknown; message?: unknown }) =>
            typeof field?.path === 'string' &&
            typeof field?.message === 'string',
        )
      : [];
    throw new ApiError(
      typeof body?.error?.message === 'string'
        ? body.error.message
        : 'Something went wrong. Please try again.',
      response.status,
      fields,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
