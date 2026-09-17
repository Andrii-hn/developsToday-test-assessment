import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Quiz Builder',
    template: '%s | Quiz Builder',
  },
  description: 'Create and organize quizzes with different question types.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-4 focus:rounded-md focus:bg-white focus:p-3 focus:outline-2 focus:outline-indigo-600"
        >
          Skip to content
        </a>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center px-4 py-5 sm:px-6">
            <Link
              href="/quizzes"
              className="rounded-sm text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            >
              Quiz Builder<span className="text-indigo-600">.</span>
            </Link>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
