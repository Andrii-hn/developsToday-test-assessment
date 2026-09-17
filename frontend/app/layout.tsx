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
          className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-4 focus:rounded-md focus:bg-white focus:p-3 focus:outline-2 focus:outline-accent"
        >
          Skip to content
        </a>
        <div className="page-backdrop" aria-hidden="true" />
        <header className="border-b border-line bg-white/80">
          <div className="mx-auto flex h-18 max-w-5xl items-center gap-8 px-5 sm:gap-12 sm:px-8">
            <Link
              href="/quizzes"
              className="rounded-sm text-xl font-extrabold tracking-tight"
            >
              Quiz Builder
            </Link>
            <nav aria-label="Main navigation">
              <Link
                href="/quizzes"
                className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
              >
                Quizzes
              </Link>
            </nav>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
