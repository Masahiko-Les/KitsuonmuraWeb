import { DesertStoryFormData } from '../../types/desertStory';
import { DesertFormErrors, MIN_TEXT_LENGTH } from '../../utils/desertValidation';
import '../../styles/Desert.css';

interface Props {
  formData: DesertStoryFormData;
  onChange: (field: keyof DesertStoryFormData, value: string) => void;
  errors: DesertFormErrors;
}

const MAX_TITLE = 60;
const MAX_TEXT = 2000;

interface SectionFieldProps {
  label: string;
  fieldKey: keyof DesertStoryFormData;
  value: string;
  onChange: (field: keyof DesertStoryFormData, value: string) => void;
  error?: string;
  placeholder: string;
}

const SectionField = ({ label, fieldKey, value, onChange, error, placeholder }: SectionFieldProps) => {
  const count = value.trim().length;
  const isBelowMin = count < MIN_TEXT_LENGTH;

  return (
    <div className="form-group">
      <label>{label}</label>
      <p className="desert-field-hint">
        {MIN_TEXT_LENGTH}文字以上で書いてください
      </p>
      <div className="desert-textarea-wrap">
        <textarea
          className={`desert-textarea ${isBelowMin && value.length > 0 ? 'desert-textarea--warn' : ''}`}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          rows={10}
          maxLength={MAX_TEXT}
        />
        <span className={`desert-textarea-count ${isBelowMin && value.length > 0 ? 'desert-textarea-count--warn' : ''}`}>
          {count} / {MAX_TEXT}文字（{MIN_TEXT_LENGTH}文字以上必要）
        </span>
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

const DesertStoryForm = ({ formData, onChange, errors }: Props) => (
  <div className="desert-form">
    <div className="form-group">
      <label>タイトル</label>
      <div className="desert-textarea-wrap">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="物語のタイトルをつけてください"
          maxLength={MAX_TITLE}
        />
        <span className="desert-textarea-count">
          {formData.title.length} / {MAX_TITLE}文字
        </span>
      </div>
      {errors.title && <span className="form-error">{errors.title}</span>}
    </div>

    <SectionField
      label="① どんな苦しみに直面しましたか？"
      fieldKey="hardshipText"
      value={formData.hardshipText}
      onChange={onChange}
      error={errors.hardshipText}
      placeholder={`吃音によって、どんな場面で、どんな苦しさを感じていましたか。\n具体的なエピソードを交えながら、ゆっくり書いてみてください。`}
    />

    <SectionField
      label="② それにどう向き合いましたか？"
      fieldKey="facingText"
      value={formData.facingText}
      onChange={onChange}
      error={errors.facingText}
      placeholder={`苦しさの中で、どんなことを考えたり、試みたりしましたか。\nうまくいかなかったことも含めて書いてください。`}
    />

    <SectionField
      label="③ どう乗り越えましたか？（または今どう向き合っていますか？）"
      fieldKey="overcomeText"
      value={formData.overcomeText}
      onChange={onChange}
      error={errors.overcomeText}
      placeholder={`今だから伝えられることを、ゆっくり書いてみてください。\n完全に乗り越えていなくても大丈夫です。今の自分の言葉で。`}
    />
  </div>
);

export default DesertStoryForm;
