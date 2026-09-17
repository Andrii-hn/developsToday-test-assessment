import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { QuizForm } from './quiz-form';

const { request, push, refresh } = vi.hoisted(() => ({
  request: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock('@/lib/quizzes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/quizzes')>()),
  apiRequest: request,
}));
afterEach(cleanup);
const warning = 'Please check the highlighted fields before saving.';

for (const correctEarlierErrors of [false, true]) {
  test(`successful save never flashes validation warning (earlier errors: ${correctEarlierErrors})`, async () => {
    const user = userEvent.setup();
    let resolveSave!: (value: { id: string }) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );
    render(<QuizForm />);
    if (correctEarlierErrors) {
      await user.click(screen.getByRole('button', { name: 'Save quiz' }));
      expect(await screen.findByText(warning)).toBeTruthy();
      expect(request).not.toHaveBeenCalled();
    }
    await user.type(screen.getByLabelText('Quiz title'), 'Valid quiz');
    await user.type(
      screen.getByLabelText('Question text'),
      'Is JavaScript Java?',
    );
    await user.click(screen.getByLabelText('False', { exact: true }));
    await waitFor(() => expect(screen.queryByText(warning)).toBeNull());

    const warnings: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.textContent?.includes(warning))
            warnings.push(node.textContent);
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
    try {
      await user.click(screen.getByRole('button', { name: 'Save quiz' }));
      await waitFor(() => expect(request).toHaveBeenCalledOnce());
      expect(
        screen
          .getByRole('button', { name: 'Saving quiz…' })
          .hasAttribute('disabled'),
      ).toBe(true);
      await act(async () => resolveSave({ id: 'saved-quiz' }));
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith('/quizzes/saved-quiz'),
      );
      expect(screen.queryByText(warning)).toBeNull();
      expect(warnings).toEqual([]);
      expect(
        JSON.parse(request.mock.calls[0]![1].body).questions[0].correctAnswer,
      ).toBe(false);
    } finally {
      observer.disconnect();
    }
  });
}

test('a failed request shows the server error and allows retrying', async () => {
  request.mockRejectedValueOnce(new Error('Unable to save. Please try again.'));
  const user = userEvent.setup();
  render(<QuizForm />);
  await user.type(screen.getByLabelText('Quiz title'), 'Valid quiz');
  await user.type(screen.getByLabelText('Question text'), 'A question');
  await user.click(screen.getByLabelText('True', { exact: true }));
  await user.click(screen.getByRole('button', { name: 'Save quiz' }));
  expect(await screen.findByRole('alert')).toHaveProperty(
    'textContent',
    'Unable to save. Please try again.',
  );
  expect(
    screen.getByRole('button', { name: 'Save quiz' }).hasAttribute('disabled'),
  ).toBe(false);
  expect(push).not.toHaveBeenCalled();
});
