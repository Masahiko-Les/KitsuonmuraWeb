import { DesertStoryFormData } from '../types/desertStory';

export const MIN_TEXT_LENGTH = 300;

export interface DesertFormErrors {
  title?: string;
  hardshipText?: string;
  facingText?: string;
  overcomeText?: string;
}

export const validateDesertForm = (data: DesertStoryFormData): DesertFormErrors => {
  const errors: DesertFormErrors = {};

  if (!data.title.trim()) {
    errors.title = 'タイトルを入力してください';
  }

  const sections: Array<{ key: keyof DesertStoryFormData; label: string }> = [
    { key: 'hardshipText', label: '①' },
    { key: 'facingText', label: '②' },
    { key: 'overcomeText', label: '③' },
  ];

  for (const { key, label } of sections) {
    const len = (data[key] as string).trim().length;
    if (len < MIN_TEXT_LENGTH) {
      errors[key] = `${label} は${MIN_TEXT_LENGTH}文字以上入力してください（現在 ${len}文字）`;
    }
  }

  return errors;
};

export const hasErrors = (errors: DesertFormErrors): boolean =>
  Object.values(errors).some(Boolean);
