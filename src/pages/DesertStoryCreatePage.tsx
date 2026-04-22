import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import DesertStoryForm from '../components/desert/DesertStoryForm';
import DesertNoticeBox from '../components/desert/DesertNoticeBox';
import { useAuth } from '../hooks/useAuth';
import { createDesertStory, updateDesertStory } from '../services/desertStoryService';
import { DesertStory, DesertStoryFormData } from '../types/desertStory';
import { validateDesertForm, hasErrors, DesertFormErrors } from '../utils/desertValidation';
import '../styles/Desert.css';

const EMPTY_FORM: DesertStoryFormData = {
  title: '',
  hardshipText: '',
  facingText: '',
  overcomeText: '',
};

interface LocationState {
  story?: DesertStory;
  formData?: DesertStoryFormData;
  editStoryId?: string | null;
}

const DesertStoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth() as any;

  const state = (location.state ?? {}) as LocationState;
  const editStory = state.story ?? null;
  const editStoryId: string | null = editStory?.id ?? state.editStoryId ?? null;

  const initForm = (): DesertStoryFormData => {
    if (state.formData) return state.formData;
    if (editStory) {
      return {
        title: editStory.title,
        hardshipText: editStory.hardshipText,
        facingText: editStory.facingText,
        overcomeText: editStory.overcomeText,
      };
    }
    return EMPTY_FORM;
  };

  const [formData, setFormData] = useState<DesertStoryFormData>(initForm);
  const [errors, setErrors] = useState<DesertFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [draftMsg, setDraftMsg] = useState('');

  const handleChange = (field: keyof DesertStoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePreview = () => {
    const errs = validateDesertForm(formData);
    if (hasErrors(errs)) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate('/desert/preview', { state: { formData, editStoryId } });
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: 'タイトルを入力してください' });
      return;
    }
    setSaving(true);
    try {
      const nickname = userProfile?.nickname ?? '名無し';
      if (editStoryId) {
        await updateDesertStory(editStoryId, { ...formData, status: 'draft' });
      } else {
        await createDesertStory({
          ...formData,
          authorUid: currentUser.uid,
          authorNickname: nickname,
          status: 'draft',
        });
      }
      setDraftMsg('下書きを保存しました');
      setTimeout(() => setDraftMsg(''), 3000);
    } catch {
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="page-container">
        <main className="desert-login-prompt">
          <p style={{ fontSize: '36px' }}>🔒</p>
          <p>物語を書くにはログインが必要です</p>
          <button
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/login')}
          >
            ログインする
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate('/desert')}>
          ← 砂漠の開拓
        </button>
        <h1 className="desert-title">{editStoryId ? '物語を編集する' : '物語を書く'}</h1>
        <p className="desert-subtitle">3部構成で、各300文字以上</p>
      </header>

      <main className="desert-create-main">
        <DesertNoticeBox />
        <DesertStoryForm formData={formData} onChange={handleChange} errors={errors} />

        {draftMsg && <p className="desert-success-msg">{draftMsg}</p>}

        <div className="desert-create-actions">
          <button
            className="desert-secondary-btn"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving ? '保存中...' : '下書き保存'}
          </button>
          <button className="btn-primary" onClick={handlePreview}>
            確認へ進む →
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertStoryCreatePage;
