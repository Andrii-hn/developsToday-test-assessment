'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest, ApiError, type QuizSummary } from '@/lib/quizzes';
import {
  Button,
  ErrorMessage,
  iconButton,
  primaryButton,
  secondaryButton,
} from './ui';

function DeleteDialog({
  quiz,
  onClose,
  onDeleted,
}: {
  quiz: QuizSummary;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      } else {
        document.getElementById('main-content')?.focus();
      }
    };
  }, []);

  async function remove() {
    setPending(true);
    setError('');
    try {
      await apiRequest<void>(`/quizzes/${quiz.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        onDeleted();
        return;
      }
      setError(
        error instanceof Error ? error.message : 'Unable to delete this quiz.',
      );
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl backdrop:bg-ink/40"
    >
      <h2 id="delete-title" className="text-xl font-bold">
        Delete this quiz?
      </h2>
      <p id="delete-description" className="mt-3 break-words text-muted">
        “{quiz.title}” and all its questions will be permanently deleted.
      </p>
      <ErrorMessage message={error} />
      <div className="mt-6 flex justify-end gap-3">
        <button
          autoFocus
          type="button"
          className={secondaryButton}
          disabled={pending}
          onClick={onClose}
        >
          Cancel
        </button>
        <Button variant="danger" disabled={pending} onClick={remove}>
          {pending ? 'Deleting…' : 'Delete quiz'}
        </Button>
      </div>
    </dialog>
  );
}

export function QuizList({
  initialQuizzes,
}: {
  initialQuizzes: QuizSummary[];
}) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<QuizSummary | null>(null);
  const [notice, setNotice] = useState('');
  const quizzes = initialQuizzes.filter(
    (quiz) => !deletedIds.includes(quiz.id),
  );
  return (
    <>
      <p
        role="status"
        className={
          notice
            ? 'mb-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800'
            : 'sr-only'
        }
      >
        {notice}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-5 pt-4 sm:pt-8">
        <div>
          <h1 className="page-heading">Your quizzes</h1>
          <p className="mt-2 text-muted">
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
          </p>
        </div>
        <Link className={primaryButton} href="/create">
          <Plus size={18} aria-hidden="true" />
          Create quiz
        </Link>
      </div>
      <div className="accent-rule" aria-hidden="true" />
      {quizzes.length === 0 ? (
        <div className="surface px-6 py-12 text-center">
          <h2 className="text-xl font-bold">No quizzes yet</h2>
          <p className="mt-2 text-muted">
            Create your first quiz to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="surface relative isolate flex min-w-0 items-center gap-4 px-5 py-4 transition-colors hover:border-blue-300 sm:px-6 sm:py-5"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold sm:text-xl">
                  <Link
                    className="break-words after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
                    href={`/quizzes/${quiz.id}`}
                  >
                    {quiz.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {quiz.questionCount}{' '}
                  {quiz.questionCount === 1 ? 'question' : 'questions'}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Delete ${quiz.title}`}
                onClick={() => setSelected(quiz)}
                className={`${iconButton} relative z-10`}
              >
                <Trash2 size={19} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <DeleteDialog
          quiz={selected}
          onClose={() => setSelected(null)}
          onDeleted={() => {
            setDeletedIds((ids) => [...ids, selected.id]);
            setNotice('Quiz deleted.');
            router.refresh();
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
