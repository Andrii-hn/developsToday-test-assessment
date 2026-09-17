import type { ButtonHTMLAttributes } from 'react';

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const primaryButton = `${buttonBase} bg-ink text-white hover:bg-zinc-700`;
export const secondaryButton = `${buttonBase} border border-slate-400 bg-white/60 text-ink hover:bg-white`;
const dangerButton = `${buttonBase} bg-red-700 text-white hover:bg-red-800`;
export const iconButton =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30';
export const inputClass =
  'mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-ink focus:border-accent focus:ring-1 focus:ring-accent focus-visible:outline-none aria-invalid:border-red-600';
export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger';
}) {
  return (
    <button
      className={`${variant === 'danger' ? dangerButton : primaryButton} ${className}`}
      {...props}
    />
  );
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
