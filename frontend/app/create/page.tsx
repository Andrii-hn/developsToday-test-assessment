import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuizForm } from '@/components/quiz-form/quiz-form';
export const metadata = { title: 'Create a quiz' };
export default function CreateQuizPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/quizzes"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All quizzes
      </Link>
      <h1 className="page-heading">Create a quiz</h1>
      <p className="mt-3 leading-7 text-muted">
        Write questions and choose the correct answers. All fields are required.
      </p>
      <div className="accent-rule" aria-hidden="true" />
      <QuizForm />
    </div>
  );
}
