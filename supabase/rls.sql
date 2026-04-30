-- ============================================================
-- Kitsuonmura Web — RLS ポリシー（permissive版）
-- 既存ポリシーを全削除してから再作成する
-- ============================================================

-- 既存ポリシーを全削除
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- RLS 有効化（冪等）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_esteem_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE desert_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE desert_story_waters ENABLE ROW LEVEL SECURITY;
ALTER TABLE desert_story_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE desert_story_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE villager_counter ENABLE ROW LEVEL SECURITY;

-- 全テーブルに permissive ポリシーを設定
-- anon キー経由の全操作を許可。書き込み権限はアプリコード側で担保する。
CREATE POLICY "allow_all" ON users             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON posts             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON post_likes        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON post_reports      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON book_reviews      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON movie_reviews     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON self_esteem_stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON desert_stories    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON desert_story_waters    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON desert_story_favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON desert_story_reports   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON villager_counter  FOR ALL USING (true) WITH CHECK (true);
