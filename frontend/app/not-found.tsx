import Link from 'next/link';
import { primaryButton } from '@/components/ui';
export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-indigo-700">404</p>
      <h1 className="mt-3 text-3xl font-bold">This page couldn’t be found</h1>
      <p className="mt-3 text-slate-600">
        The quiz may have been deleted, or the link is incorrect.
      </p>
      <Link href="/quizzes" className={`${primaryButton} mt-6`}>
        Back to quizzes
      </Link>
    </div>
  );
}
