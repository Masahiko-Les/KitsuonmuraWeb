import { doc, getDoc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

export const toggleDesertWater = async (storyId: string, userUid: string): Promise<boolean> => {
  const waterId = `${userUid}_${storyId}`;
  const waterRef = doc(db, 'desertStoryWaters', waterId);
  const storyRef = doc(db, 'desertStories', storyId);

  let watered = false;
  await runTransaction(db, async (tx) => {
    const waterSnap = await tx.get(waterRef);
    if (waterSnap.exists()) {
      tx.delete(waterRef);
      tx.update(storyRef, { waterCount: increment(-1) });
      watered = false;
    } else {
      tx.set(waterRef, { userUid, storyId, createdAt: serverTimestamp() });
      tx.update(storyRef, { waterCount: increment(1) });
      watered = true;
    }
  });
  return watered;
};

export const checkWatered = async (storyId: string, userUid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'desertStoryWaters', `${userUid}_${storyId}`));
  return snap.exists();
};
