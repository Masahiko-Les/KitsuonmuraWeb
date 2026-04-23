// Firestore に関する処理をまとめたファイル
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ユーザープロフィールの作成・更新（mergeで既存データを保持）
export const createOrMergeUserProfile = (uid, data) =>
  setDoc(doc(db, 'users', uid), data, { merge: true });

// ログイン時に lastLoginAt を現在時刻で更新（他のフィールドは消さない）
// 初回ログイン時はまだドキュメントが存在しないためエラーを無視する
export const updateLastLoginAt = async (uid) => {
  try {
    await setDoc(doc(db, 'users', uid), { lastLoginAt: serverTimestamp() }, { merge: true });
  } catch {
    // onboarding前はドキュメント未作成のため無視
  }
};

// 村人人数を集計して返す
// - totalVillagers  : agreedToTerms=true かつ nickname が存在するユーザー数
// - recentVillagers : 上記のうち lastLoginAt が直近7日以内のユーザー数
export const getVillageStats = async () => {
  // 7日前の Timestamp を作成
  const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 総村人数クエリ
  const totalSnap = await getDocs(
    query(
      collection(db, 'users'),
      where('agreedToTerms', '==', true),
      where('nickname', '!=', '')
    )
  );

  // 直近7日以内に訪れた村人クエリ
  const recentSnap = await getDocs(
    query(
      collection(db, 'users'),
      where('agreedToTerms', '==', true),
      where('lastLoginAt', '>=', sevenDaysAgo)
    )
  );

  return {
    totalVillagers: totalSnap.size,
    recentVillagers: recentSnap.size,
  };
};

// ユーザープロフィールの取得
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

// 投稿の作成
export const createPost = ({ text, authorUid, authorName }) =>
  addDoc(collection(db, 'posts'), {
    text,
    authorUid,
    authorName,
    createdAt: serverTimestamp(),
    likeCount: 0,
    reportCount: 0,
    isHidden: false,
  });

// 表示可能な投稿をリアルタイム購読（非表示は除く・新しい順）
export const subscribeVisiblePosts = (callback) => {
  const q = query(
    collection(db, 'posts'),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
};

// 自分の投稿を削除
export const deleteOwnPost = (postId) =>
  deleteDoc(doc(db, 'posts', postId));

// いいねのトグル（トランザクションで整合性を保つ）
export const toggleLike = async (postId, uid) => {
  const likeId = `${postId}_${uid}`;
  const likeRef = doc(db, 'postLikes', likeId);
  const postRef = doc(db, 'posts', postId);

  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) {
      // 既にいいね済み → 取り消し
      tx.delete(likeRef);
      tx.update(postRef, { likeCount: increment(-1) });
    } else {
      // 未いいね → 追加
      tx.set(likeRef, {
        postId,
        userUid: uid,
        createdAt: serverTimestamp(),
      });
      tx.update(postRef, { likeCount: increment(1) });
    }
  });
};

// 現在のユーザーがいいねしているか確認
export const checkLiked = async (postId, uid) => {
  const likeId = `${postId}_${uid}`;
  const snap = await getDoc(doc(db, 'postLikes', likeId));
  return snap.exists();
};

// ========== 図書館：書評 ==========

// 書評を投稿する
export const createBookReview = ({ bookId, quote, feeling, authorUid, authorName }) =>
  addDoc(collection(db, 'bookReviews'), {
    bookId,
    quote,
    feeling,
    authorUid,
    authorName,
    createdAt: serverTimestamp(),
  });

// 指定した本の書評をリアルタイム購読（新しい順）
export const subscribeBookReviews = (bookId, callback) => {
  const q = query(
    collection(db, 'bookReviews'),
    where('bookId', '==', bookId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reviews);
  });
};

// 自分の書評を削除
export const deleteOwnBookReview = (reviewId) =>
  deleteDoc(doc(db, 'bookReviews', reviewId));

// ========== 映画館：映画レビュー ==========

// 映画レビューを投稿する
export const createMovieReview = ({ movieId, scene, feeling, authorUid, authorName }) =>
  addDoc(collection(db, 'movieReviews'), {
    movieId,
    scene,
    feeling,
    authorUid,
    authorName,
    createdAt: serverTimestamp(),
  });

// 指定した映画のレビューをリアルタイム購読（新しい順）
export const subscribeMovieReviews = (movieId, callback) => {
  const q = query(
    collection(db, 'movieReviews'),
    where('movieId', '==', movieId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reviews);
  });
};

// 自分の映画レビューを削除
export const deleteOwnMovieReview = (reviewId) =>
  deleteDoc(doc(db, 'movieReviews', reviewId));

// ========== 自分の家 ==========

// 自分が投稿した本のレビューを取得（新しい順）
export const getMyBookReviews = async (uid) => {
  const snap = await getDocs(
    query(
      collection(db, 'bookReviews'),
      where('authorUid', '==', uid),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// 自分が投稿した映画レビューを取得（新しい順）
export const getMyMovieReviews = async (uid) => {
  const snap = await getDocs(
    query(
      collection(db, 'movieReviews'),
      where('authorUid', '==', uid),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// できたことストックを投稿する
export const createSelfEsteemStock = ({ text, authorUid }) =>
  addDoc(collection(db, 'selfEsteemStocks'), {
    text,
    authorUid,
    createdAt: serverTimestamp(),
  });

// 自分のできたことストックをリアルタイム購読（新しい順）
export const subscribeMySelfEsteemStocks = (uid, callback) => {
  const q = query(
    collection(db, 'selfEsteemStocks'),
    where('authorUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const stocks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(stocks);
  });
};

// できたことストックを削除（本人のみ）
export const deleteMySelfEsteemStock = (stockId) =>
  deleteDoc(doc(db, 'selfEsteemStocks', stockId));

// 通報（1ユーザー1回・reportCount>=3でisHidden化）
export const reportPost = async (postId, uid) => {
  const reportId = `${postId}_${uid}`;
  const reportRef = doc(db, 'postReports', reportId);
  const postRef = doc(db, 'posts', postId);

  await runTransaction(db, async (tx) => {
    const reportSnap = await tx.get(reportRef);
    if (reportSnap.exists()) {
      throw new Error('already_reported');
    }
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists()) {
      throw new Error('post_not_found');
    }
    const newCount = (postSnap.data().reportCount || 0) + 1;

    tx.set(reportRef, {
      postId,
      userUid: uid,
      createdAt: serverTimestamp(),
    });
    tx.update(postRef, {
      reportCount: newCount,
      isHidden: newCount >= 3,
    });
  });
};
