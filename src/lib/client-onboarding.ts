export type ClientOnboardingQuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'yes_no'
  | 'select';

export type ClientOnboardingQuestionDraft = {
  id?: string;
  question_text: string;
  question_type: ClientOnboardingQuestionType;
  is_required: boolean;
  placeholder: string;
  question_order: number;
  options: string[];
};

export const CLIENT_ONBOARDING_QUESTION_TYPES: Array<{
  value: ClientOnboardingQuestionType;
  label: string;
}> = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone number' },
  { value: 'number', label: 'Number' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'select', label: 'Dropdown' },
];

export const DEFAULT_CLIENT_ONBOARDING_QUESTIONS: ClientOnboardingQuestionDraft[] = [
  {
    question_text: "What's your business name?",
    question_type: 'text',
    is_required: true,
    placeholder: 'Acme Inc.',
    question_order: 0,
    options: [],
  },
  {
    question_text: 'What is your best contact phone number?',
    question_type: 'phone',
    is_required: true,
    placeholder: '+1 (555) 000-0000',
    question_order: 1,
    options: [],
  },
  {
    question_text: 'Main goal for the next 90 days',
    question_type: 'textarea',
    is_required: true,
    placeholder: 'Describe your primary goal and current bottleneck.',
    question_order: 2,
    options: [],
  },
];

export function normalizeQuestionType(raw: unknown): ClientOnboardingQuestionType {
  const s = String(raw || '').trim().toLowerCase();
  if (
    s === 'text' ||
    s === 'textarea' ||
    s === 'email' ||
    s === 'phone' ||
    s === 'number' ||
    s === 'yes_no' ||
    s === 'select'
  ) {
    return s;
  }
  if (s === 'instagram') return 'text';
  return 'text';
}

export function normalizeQuestionOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x || '').trim()).filter(Boolean);
}

export function toQuestionOptionsJson(options: string[]): string[] | null {
  const clean = options.map((x) => String(x || '').trim()).filter(Boolean);
  return clean.length ? clean : null;
}

