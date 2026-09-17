'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { questionLabels } from '@/lib/quizzes';
import { inputClass } from '../ui';
import type { QuestionType } from './schema';

export function QuestionTypeSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(value) => onChange(value as QuestionType)}
    >
      <Select.Trigger
        id={id}
        aria-describedby={`${id}-note`}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={16} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 max-h-[var(--radix-select-content-available-height)] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-line bg-white p-1 text-ink shadow-lg"
          onCloseAutoFocus={(event) => {
            // A type change remounts the field-array row; focus its new trigger.
            event.preventDefault();
            document.getElementById(id)?.focus();
          }}
        >
          <Select.Viewport>
            {Object.entries(questionLabels).map(([type, label]) => (
              <Select.Item
                key={type}
                value={type}
                className="relative flex min-h-11 cursor-pointer items-center rounded-sm py-2 pr-3 pl-9 text-sm outline-none data-highlighted:bg-blue-50 data-highlighted:text-blue-900"
              >
                <Select.ItemIndicator className="absolute left-3">
                  <Check size={16} aria-hidden="true" />
                </Select.ItemIndicator>
                <Select.ItemText>{label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
