'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Plus, Trash2 } from 'lucide-react';
import { apiRequest, ApiError, type QuizSummary } from '@/lib/quizzes';
import { Button, ErrorMessage, primaryButton, secondaryButton } from './ui';

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
    dialog.current?.showModal();
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
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/40"
    >
      <h2 id="delete-title" className="text-xl font-bold">
        Delete this quiz?
      </h2>
      <p id="delete-description" className="mt-3 break-words text-slate-600">
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
        <Button
          className="bg-red-600 hover:bg-red-700"
          disabled={pending}
          onClick={remove}
        >
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
      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookOpen
            className="mx-auto mb-4 text-indigo-600"
            size={32}
            aria-hidden="true"
          />
          <h2 className="text-xl font-bold">Your first quiz starts here</h2>
          <p className="mx-auto mt-2 max-w-sm text-slate-600">
            Combine different question types and build a quiz of your own.
          </p>
          <Link href="/create" className={`${primaryButton} mt-6`}>
            <Plus size={18} aria-hidden="true" />
            Create a quiz
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="mb-3 text-sm text-slate-500">
                {quiz.questionCount}{' '}
                {quiz.questionCount === 1 ? 'question' : 'questions'}
              </p>
              <h2 className="min-w-0 flex-1 text-xl font-semibold">
                <Link
                  className="break-words rounded-sm hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  href={`/quizzes/${quiz.id}`}
                >
                  {quiz.title}
                </Link>
              </h2>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-sm text-sm font-semibold text-indigo-700 hover:underline"
                >
                  View quiz
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${quiz.title}`}
                  onClick={() => setSelected(quiz)}
                  className="rounded-lg p-3 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
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
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
