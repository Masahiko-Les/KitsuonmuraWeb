-- ============================================================
-- Kitsuonmura Web — Supabase スキーマ定義
-- Supabase SQL Editor でこのファイルの内容を実行してください
-- ============================================================

-- ユーザープロフィール
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT,
  nickname TEXT,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  village_profile_completed BOOLEAN NOT NULL DEFAULT false,
  stutter_type TEXT,
  stutter_type_other TEXT NOT NULL DEFAULT '',
  difficult_sounds_top3 TEXT[] NOT NULL DEFAULT '{}',
  villager_no_numeric INTEGER,
  villager_no TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 村人番号カウンター（1行のみ）
CREATE TABLE villager_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_number INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO villager_counter (id, last_number) VALUES (1, 0);

-- 広場：投稿
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 広場：いいね
CREATE TABLE post_likes (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_uid)
);

-- 広場：通報
CREATE TABLE post_reports (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_uid)
);

-- 図書館：書評
CREATE TABLE book_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,
  quote TEXT NOT NULL,
  feeling TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 映画館：映画レビュー
CREATE TABLE movie_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id TEXT NOT NULL,
  scene TEXT NOT NULL,
  feeling TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 自分の家：できたことストック
CREATE TABLE self_esteem_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 砂漠の開拓：ストーリー
CREATE TABLE desert_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_uid TEXT NOT NULL,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  hardship_text TEXT NOT NULL,
  facing_text TEXT NOT NULL,
  overcome_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  water_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  blocked_by_moderation BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 砂漠：水やり
CREATE TABLE desert_story_waters (
  story_id UUID NOT NULL REFERENCES desert_stories(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, user_uid)
);

-- 砂漠：お気に入り
CREATE TABLE desert_story_favorites (
  story_id UUID NOT NULL REFERENCES desert_stories(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, user_uid)
);

-- 砂漠：通報
CREATE TABLE desert_story_reports (
  story_id UUID NOT NULL REFERENCES desert_stories(id) ON DELETE CASCADE,
  reporter_uid TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, reporter_uid)
);

-- ============================================================
-- Realtime を有効にするテーブルを Publication に追加
-- （Supabase Dashboard > Database > Replication でも設定可能）
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE book_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE movie_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE self_esteem_stocks;
