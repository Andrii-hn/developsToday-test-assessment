'use client';
import Link from 'next/link';
import { Button, secondaryButton } from '@/components/ui';
export default function QuizzesError({ reset }: { reset: () => void }) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-8 text-center"
      role="alert"
    >
      <h1 className="text-2xl font-bold">We couldn’t load your quizzes</h1>
      <p className="mt-3 text-slate-600">
        The server may be unavailable. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/quizzes" className={secondaryButton}>
          All quizzes
        </Link>
      </div>
    </div>
  );
}
