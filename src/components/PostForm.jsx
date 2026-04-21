// 広場への投稿フォーム
import { useState } from 'react';
import { createPost } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import '../styles/PostForm.css';

const MAX_LENGTH = 200;

const PostForm = () => {
  const { currentUser, userProfile } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('ひとことどうぞ');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`${MAX_LENGTH}文字以内で書いてください`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createPost({
        text: trimmed,
        authorUid: currentUser.uid,
        authorName: userProfile.nickname,
      });
      setText('');
    } catch (err) {
      console.error(err);
      setError('投稿に失敗しました。もう一度お試しください');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <textarea
        className="post-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="今日の気持ちや体験をこの広場にそっと置いていきませんか"
        maxLength={MAX_LENGTH}
        rows={4}
      />
      <div className="post-form-footer">
        <span className={`char-count ${text.length > MAX_LENGTH ? 'over' : ''}`}>
          {text.length} / {MAX_LENGTH}
        </span>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || !text.trim()}
        >
          {submitting ? '投稿中...' : '広場に置く'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
};

export default PostForm;
