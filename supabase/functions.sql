-- ============================================================
-- Kitsuonmura Web — ストアドプロシージャ（アトミック操作）
-- rls.sql を実行した後にこのファイルを実行してください
-- ============================================================

-- ============================================================
-- 村人プロフィール登録（村人番号の採番を含むトランザクション）
-- ============================================================
CREATE OR REPLACE FUNCTION save_village_profile(
  p_uid TEXT,
  p_stutter_type TEXT,
  p_stutter_type_other TEXT,
  p_difficult_sounds_top3 TEXT[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_number INTEGER;
  existing_number INTEGER;
BEGIN
  -- 既に村人番号が割り当て済みかチェック
  SELECT villager_no_numeric INTO existing_number FROM users WHERE uid = p_uid;

  IF existing_number IS NULL THEN
    -- 新規村人：カウンターをアトミックにインクリメント
    UPDATE villager_counter
    SET last_number = last_number + 1
    WHERE id = 1
    RETURNING last_number INTO new_number;
  ELSE
    new_number := existing_number;
  END IF;

  INSERT INTO users (
    uid,
    stutter_type,
    stutter_type_other,
    difficult_sounds_top3,
    villager_no_numeric,
    villager_no,
    village_profile_completed,
    updated_at
  ) VALUES (
    p_uid,
    p_stutter_type,
    p_stutter_type_other,
    p_difficult_sounds_top3,
    new_number,
    '村人No.' || LPAD(new_number::TEXT, 5, '0'),
    true,
    now()
  )
  ON CONFLICT (uid) DO UPDATE SET
    stutter_type             = EXCLUDED.stutter_type,
    stutter_type_other       = EXCLUDED.stutter_type_other,
    difficult_sounds_top3    = EXCLUDED.difficult_sounds_top3,
    villager_no_numeric      = EXCLUDED.villager_no_numeric,
    villager_no              = EXCLUDED.villager_no,
    village_profile_completed = true,
    updated_at               = now();
END;
$$;

-- ============================================================
-- 広場：いいねのトグル（アトミック）
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_user_uid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  liked BOOLEAN;
BEGIN
  IF EXISTS (
    SELECT 1 FROM post_likes
    WHERE post_id = p_post_id AND user_uid = p_user_uid
  ) THEN
    DELETE FROM post_likes WHERE post_id = p_post_id AND user_uid = p_user_uid;
    UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = p_post_id;
    liked := false;
  ELSE
    INSERT INTO post_likes (post_id, user_uid) VALUES (p_post_id, p_user_uid);
    UPDATE posts SET like_count = like_count + 1 WHERE id = p_post_id;
    liked := true;
  END IF;
  RETURN liked;
END;
$$;

-- ============================================================
-- 広場：通報（1ユーザー1回・3件でisHidden化）
-- ============================================================
CREATE OR REPLACE FUNCTION report_post(p_post_id UUID, p_user_uid TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM post_reports
    WHERE post_id = p_post_id AND user_uid = p_user_uid
  ) THEN
    RAISE EXCEPTION 'already_reported';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM posts WHERE id = p_post_id) THEN
    RAISE EXCEPTION 'post_not_found';
  END IF;

  INSERT INTO post_reports (post_id, user_uid) VALUES (p_post_id, p_user_uid);

  UPDATE posts
  SET
    report_count = report_count + 1,
    is_hidden = CASE WHEN report_count + 1 >= 3 THEN true ELSE is_hidden END
  WHERE id = p_post_id;
END;
$$;

-- ============================================================
-- 砂漠：水やりのトグル（アトミック）
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_desert_water(p_story_id UUID, p_user_uid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  watered BOOLEAN;
BEGIN
  IF EXISTS (
    SELECT 1 FROM desert_story_waters
    WHERE story_id = p_story_id AND user_uid = p_user_uid
  ) THEN
    DELETE FROM desert_story_waters WHERE story_id = p_story_id AND user_uid = p_user_uid;
    UPDATE desert_stories SET water_count = GREATEST(0, water_count - 1) WHERE id = p_story_id;
    watered := false;
  ELSE
    INSERT INTO desert_story_waters (story_id, user_uid) VALUES (p_story_id, p_user_uid);
    UPDATE desert_stories SET water_count = water_count + 1 WHERE id = p_story_id;
    watered := true;
  END IF;
  RETURN watered;
END;
$$;

-- ============================================================
-- 砂漠：お気に入りのトグル（アトミック）
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_desert_favorite(p_story_id UUID, p_user_uid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  favorited BOOLEAN;
BEGIN
  IF EXISTS (
    SELECT 1 FROM desert_story_favorites
    WHERE story_id = p_story_id AND user_uid = p_user_uid
  ) THEN
    DELETE FROM desert_story_favorites WHERE story_id = p_story_id AND user_uid = p_user_uid;
    UPDATE desert_stories SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = p_story_id;
    favorited := false;
  ELSE
    INSERT INTO desert_story_favorites (story_id, user_uid) VALUES (p_story_id, p_user_uid);
    UPDATE desert_stories SET favorite_count = favorite_count + 1 WHERE id = p_story_id;
    favorited := true;
  END IF;
  RETURN favorited;
END;
$$;

-- ============================================================
-- 砂漠：通報（1ユーザー1回・3件でblockedByModeration化）
-- ============================================================
CREATE OR REPLACE FUNCTION report_desert_story(
  p_story_id UUID,
  p_reporter_uid TEXT,
  p_reason TEXT DEFAULT ''
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM desert_story_reports
    WHERE story_id = p_story_id AND reporter_uid = p_reporter_uid
  ) THEN
    RAISE EXCEPTION 'already_reported';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM desert_stories WHERE id = p_story_id) THEN
    RAISE EXCEPTION 'story_not_found';
  END IF;

  INSERT INTO desert_story_reports (story_id, reporter_uid, reason)
  VALUES (p_story_id, p_reporter_uid, p_reason);

  UPDATE desert_stories
  SET
    report_count = report_count + 1,
    blocked_by_moderation = CASE WHEN report_count + 1 >= 3 THEN true ELSE blocked_by_moderation END,
    status = CASE WHEN report_count + 1 >= 3 THEN 'hidden' ELSE status END
  WHERE id = p_story_id;
END;
$$;
