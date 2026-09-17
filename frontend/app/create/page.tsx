import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuizForm } from '@/components/quiz-form/quiz-form';
export const metadata = { title: 'Create a quiz' };
export default function CreateQuizPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/quizzes"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All quizzes
      </Link>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Create a quiz
      </h1>
      <p className="mt-3 mb-8 text-slate-600">
        Write your questions and mark the correct answers. All fields are
        required.
      </p>
      <QuizForm />
    </div>
  );
}
