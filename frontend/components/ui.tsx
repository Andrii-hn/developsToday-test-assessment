import type { ButtonHTMLAttributes } from 'react';

export const primaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50';
export const inputClass =
  'mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 aria-invalid:border-red-600';
export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${primaryButton} ${className}`} {...props} />;
}
export function ErrorMessage({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  return message ? (
    <p id={id} className="mt-2 text-sm text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}
