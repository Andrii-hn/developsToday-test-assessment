import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your quizzes',
};

export default function QuizzesPage() {
  return (
    <section aria-labelledby="quizzes-heading">
      <h1
        id="quizzes-heading"
        className="text-3xl font-bold tracking-tight sm:text-4xl"
      >
        Your quizzes
      </h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
        A place for your questions, ideas, and the quizzes you create.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">
          Your workspace is taking shape
        </h2>
        <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
          Quiz creation and your saved quizzes will appear here soon.
        </p>
      </div>
    </section>
  );
}
