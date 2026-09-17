'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPath,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest, ApiError, questionLabels, type Quiz } from '@/lib/quizzes';
import { Button, ErrorMessage, inputClass, secondaryButton } from '../ui';
import {
  createQuizSchema,
  newQuestion,
  type CreateQuizInput,
  type QuestionType,
  type QuizFormValues,
} from './schema';

type FormContext = ReturnType<
  typeof useForm<QuizFormValues, unknown, CreateQuizInput>
>;
function useQuizForm(): FormContext {
  return useFormContext<QuizFormValues, unknown, CreateQuizInput>();
}
function FieldError({ name }: { name: FieldPath<QuizFormValues> }) {
  const { getFieldState, formState } = useQuizForm();
  const error = getFieldState(name, formState).error;
  return (
    <ErrorMessage
      id={`${name}-error`}
      message={error?.message ?? error?.root?.message}
    />
  );
}
function TextField({
  name,
  label,
  maxLength,
  multiline = false,
}: {
  name: FieldPath<QuizFormValues>;
  label: string;
  maxLength: number;
  multiline?: boolean;
}) {
  const { register, getFieldState, formState } = useQuizForm();
  const props = {
    ...register(name),
    id: name,
    maxLength,
    'aria-invalid': !!getFieldState(name, formState).error,
    'aria-describedby': `${name}-error`,
    className: inputClass,
  };
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea {...props} rows={3} />
      ) : (
        <input {...props} type="text" />
      )}
      <FieldError name={name} />
    </div>
  );
}
function OptionsEditor({ index }: { index: number }) {
  const { control, register } = useQuizForm();
  const name = `questions.${index}.options` as const;
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Answer options</legend>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Check every correct answer. Choose at least one.
      </p>
      <div className="space-y-4">
        {fields.map((field, optionIndex) => (
          <div
            key={field.id}
            className="rounded-lg border border-slate-200 p-3"
          >
            <TextField
              name={`${name}.${optionIndex}.text`}
              label={`Option ${optionIndex + 1}`}
              maxLength={300}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register(`${name}.${optionIndex}.isCorrect`)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Correct answer
                <span className="sr-only"> for option {optionIndex + 1}</span>
              </label>
              <button
                type="button"
                aria-label={`Remove option ${optionIndex + 1}`}
                disabled={fields.length <= 2}
                onClick={() => remove(optionIndex)}
                className="rounded-lg p-3 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <FieldError name={name} />
      <button
        type="button"
        className={`${secondaryButton} mt-4`}
        disabled={fields.length >= 20}
        onClick={() => append({ text: '', isCorrect: false })}
      >
        <Plus size={16} aria-hidden="true" />
        Add option
      </button>
      <span className="ml-3 text-xs text-slate-500">{fields.length} / 20</span>
    </fieldset>
  );
}
function QuestionEditor({
  index,
  type,
  count,
  onTypeChange,
  onRemove,
}: {
  index: number;
  type: QuestionType;
  count: number;
  onTypeChange: (type: QuestionType) => void;
  onRemove: () => void;
}) {
  const { control } = useQuizForm();
  const answerName = `questions.${index}.correctAnswer` as const;
  return (
    <section
      aria-labelledby={`question-${index}-heading`}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 id={`question-${index}-heading`} className="text-lg font-bold">
          Question {index + 1}
        </h2>
        <button
          type="button"
          disabled={count <= 1}
          onClick={onRemove}
          aria-label={`Remove question ${index + 1}`}
          className="rounded-lg p-3 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-5">
        <div>
          <label
            htmlFor={`question-${index}-type`}
            className="text-sm font-semibold"
          >
            Question type
          </label>
          <select
            id={`question-${index}-type`}
            className={inputClass}
            value={type}
            onChange={(event) =>
              onTypeChange(event.target.value as QuestionType)
            }
            aria-describedby={`question-${index}-type-note`}
          >
            {Object.entries(questionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p
            id={`question-${index}-type-note`}
            className="mt-2 text-xs text-slate-500"
          >
            Changing the type clears the answers and keeps the question text.
          </p>
        </div>
        <TextField
          name={`questions.${index}.text`}
          label="Question text"
          maxLength={1000}
          multiline
        />
        {type === 'BOOLEAN' && (
          <fieldset aria-describedby={`${answerName}-error`}>
            <legend className="text-sm font-semibold">Correct answer</legend>
            <Controller
              control={control}
              name={answerName}
              render={({ field }) => (
                <div className="mt-2 flex gap-3">
                  {[true, false].map((value) => (
                    <label
                      key={String(value)}
                      className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 p-3 text-sm has-checked:border-indigo-600 has-checked:bg-indigo-50"
                    >
                      <input
                        ref={value ? field.ref : undefined}
                        type="radio"
                        name={field.name}
                        checked={field.value === value}
                        onBlur={field.onBlur}
                        onChange={() => field.onChange(value)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {value ? 'True' : 'False'}
                    </label>
                  ))}
                </div>
              )}
            />
            <FieldError name={answerName} />
          </fieldset>
        )}
        {type === 'INPUT' && (
          <TextField name={answerName} label="Correct answer" maxLength={500} />
        )}
        {type === 'CHECKBOX' && <OptionsEditor key={index} index={index} />}
      </div>
    </section>
  );
}

export function QuizForm() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const form = useForm<QuizFormValues, unknown, CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: { title: '', questions: [newQuestion('BOOLEAN')] },
  });
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  const pending = form.formState.isSubmitting || saved;
  async function submit(input: CreateQuizInput) {
    form.clearErrors('root');
    try {
      const quiz = await apiRequest<Quiz>('/quizzes', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setSaved(true);
      router.push(`/quizzes/${quiz.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        error.fields.forEach((field) =>
          form.setError(field.path as FieldPath<QuizFormValues>, {
            message: field.message,
          }),
        );
      }
      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to save your quiz. Please try again.',
      });
    }
  }
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(submit)}>
        <fieldset
          disabled={pending}
          className="min-w-0 space-y-6 disabled:opacity-70"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <TextField name="title" label="Quiz title" maxLength={120} />
            <p className="mt-2 text-xs text-slate-500">
              Give your quiz a clear, descriptive name.
            </p>
          </div>
          {fields.map((field, index) => (
            <QuestionEditor
              key={field.id}
              index={index}
              type={field.type}
              count={fields.length}
              onRemove={() => remove(index)}
              onTypeChange={(type) =>
                update(
                  index,
                  newQuestion(type, form.getValues(`questions.${index}.text`)),
                )
              }
            />
          ))}
          <FieldError name="questions" />
          <button
            type="button"
            className={`${secondaryButton} w-full border-dashed`}
            disabled={fields.length >= 50}
            onClick={() =>
              append(newQuestion('BOOLEAN'), { shouldFocus: false })
            }
          >
            <Plus size={18} aria-hidden="true" />
            Add question{' '}
            <span className="font-normal text-slate-500">
              ({fields.length} / 50)
            </span>
          </button>
        </fieldset>
        <ErrorMessage message={form.formState.errors.root?.message} />
        {form.formState.isSubmitted &&
          !pending &&
          !!(form.formState.errors.title || form.formState.errors.questions) &&
          !form.formState.errors.root && (
            <ErrorMessage message="Please check the highlighted fields before saving." />
          )}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          {!pending && (
            <Link href="/quizzes" className={secondaryButton}>
              Cancel
            </Link>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving quiz…' : 'Save quiz'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
