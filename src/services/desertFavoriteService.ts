import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DesertStory } from '../types/desertStory';

export const toggleDesertFavorite = async (storyId: string, userUid: string): Promise<boolean> => {
  const favId = `${userUid}_${storyId}`;
  const favRef = doc(db, 'desertStoryFavorites', favId);
  const storyRef = doc(db, 'desertStories', storyId);

  let favorited = false;
  await runTransaction(db, async (tx) => {
    const favSnap = await tx.get(favRef);
    if (favSnap.exists()) {
      tx.delete(favRef);
      tx.update(storyRef, { favoriteCount: increment(-1) });
      favorited = false;
    } else {
      tx.set(favRef, { userUid, storyId, createdAt: serverTimestamp() });
      tx.update(storyRef, { favoriteCount: increment(1) });
      favorited = true;
    }
  });
  return favorited;
};

export const checkFavorited = async (storyId: string, userUid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'desertStoryFavorites', `${userUid}_${storyId}`));
  return snap.exists();
};

export const getMyFavoriteStories = async (userUid: string): Promise<DesertStory[]> => {
  const snap = await getDocs(
    query(
      collection(db, 'desertStoryFavorites'),
      where('userUid', '==', userUid),
    ),
  );
  const storyIds = snap.docs.map((d) => d.data().storyId as string);
  const fetched = await Promise.all(
    storyIds.map((id) => getDoc(doc(db, 'desertStories', id))),
  );
  return fetched
    .filter((s) => s.exists())
    .map((s) => ({ id: s.id, ...s.data() } as DesertStory))
    .filter((s) => !s.isDeleted && s.status === 'published' && !s.blockedByModeration);
};
