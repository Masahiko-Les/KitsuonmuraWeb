import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';

export const reportDesertStory = async (
  storyId: string,
  reporterUid: string,
  reason = '',
): Promise<void> => {
  const reportId = `${storyId}_${reporterUid}`;
  const reportRef = doc(db, 'desertStoryReports', reportId);
  const storyRef = doc(db, 'desertStories', storyId);

  await runTransaction(db, async (tx) => {
    const reportSnap = await tx.get(reportRef);
    if (reportSnap.exists()) throw new Error('already_reported');
    const storySnap = await tx.get(storyRef);
    if (!storySnap.exists()) throw new Error('story_not_found');
    const newCount = (storySnap.data().reportCount || 0) + 1;
    tx.set(reportRef, { reporterUid, storyId, reason, createdAt: serverTimestamp() });
    tx.update(storyRef, {
      reportCount: newCount,
      ...(newCount >= 3 ? { blockedByModeration: true, status: 'hidden' } : {}),
    });
  });
};
