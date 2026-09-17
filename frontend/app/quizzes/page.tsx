import Link from 'next/link';
import { Plus } from 'lucide-react';
import { QuizList } from '@/components/quiz-list';
import { primaryButton } from '@/components/ui';
import { apiRequest, type QuizSummary } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your quizzes' };
export default async function QuizzesPage() {
  const quizzes = await apiRequest<QuizSummary[]>('/quizzes');
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            Your workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your quizzes
          </h1>
          <p className="mt-3 text-slate-600">
            A home for your questions and ideas.
          </p>
        </div>
        <Link className={primaryButton} href="/create">
          <Plus size={18} aria-hidden="true" />
          Create a quiz
        </Link>
      </div>
      <QuizList initialQuizzes={quizzes} />
    </>
  );
}
