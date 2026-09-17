import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { apiRequest, ApiError, questionLabels, type Quiz } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quiz details' };
export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let quiz: Quiz;
  try {
    quiz = await apiRequest<Quiz>(`/quizzes/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && [400, 404].includes(error.status))
      notFound();
    throw error;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/quizzes"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All quizzes
      </Link>
      <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
        {quiz.title}
      </h1>
      <p className="mt-3 text-slate-600">
        {quiz.questions.length}{' '}
        {quiz.questions.length === 1 ? 'question' : 'questions'} · Answer key
      </p>
      <ol className="mt-8 space-y-5">
        {quiz.questions.map((question, index) => (
          <li
            key={question.id}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-500">
                Question {index + 1}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {questionLabels[question.type]}
              </span>
            </div>
            <h2 className="mb-5 break-words whitespace-pre-wrap text-lg font-semibold">
              {question.text}
            </h2>
            {question.type === 'INPUT' ? (
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="mb-1 text-xs font-semibold text-emerald-800">
                  Correct answer
                </p>
                <p className="break-words whitespace-pre-wrap text-emerald-950">
                  {question.correctAnswer}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {(question.type === 'BOOLEAN'
                  ? [true, false].map((value) => ({
                      id: String(value),
                      text: value ? 'True' : 'False',
                      isCorrect: value === question.correctAnswer,
                    }))
                  : question.options
                ).map((option) => (
                  <li
                    key={option.id}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${option.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-slate-200 text-slate-600'}`}
                  >
                    <span className="min-w-0 break-words">{option.text}</span>
                    {option.isCorrect && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-800">
                        <Check size={16} aria-hidden="true" />
                        Correct
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
