import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DesertStory, DesertStoryFormData, DesertStoryStatus } from '../types/desertStory';

const COL = 'desertStories';

interface CreateInput extends DesertStoryFormData {
  authorUid: string;
  authorNickname: string;
  status: DesertStoryStatus;
}

export const createDesertStory = (data: CreateInput) =>
  addDoc(collection(db, COL), {
    authorUid: data.authorUid,
    authorNickname: data.authorNickname,
    title: data.title,
    hardshipText: data.hardshipText,
    facingText: data.facingText,
    overcomeText: data.overcomeText,
    status: data.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === 'published' ? serverTimestamp() : null,
    waterCount: 0,
    favoriteCount: 0,
    reportCount: 0,
    isDeleted: false,
    blockedByModeration: false,
  });

export const updateDesertStory = (
  storyId: string,
  fields: Partial<DesertStoryFormData & { status: DesertStoryStatus }>,
) => {
  const updates: Record<string, any> = { ...fields, updatedAt: serverTimestamp() };
  if (fields.status === 'published') {
    updates.publishedAt = serverTimestamp();
  }
  return updateDoc(doc(db, COL, storyId), updates);
};

export const softDeleteDesertStory = (storyId: string) =>
  updateDoc(doc(db, COL, storyId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });

export const getStoryById = async (storyId: string): Promise<DesertStory | null> => {
  const snap = await getDoc(doc(db, COL, storyId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DesertStory) : null;
};

export const getPublishedStories = async (): Promise<DesertStory[]> => {
  // 複合インデックス不要：単一 where のみ、ソートはクライアント側で行う
  const q = query(
    collection(db, COL),
    where('status', '==', 'published'),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as DesertStory))
    .filter((s) => !s.isDeleted && !s.blockedByModeration)
    .sort((a, b) => {
      const ta = a.publishedAt?.toMillis?.() ?? 0;
      const tb = b.publishedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
};

export const getMyStories = async (uid: string): Promise<DesertStory[]> => {
  // 複合インデックス不要：単一 where のみ、ソートはクライアント側で行う
  const q = query(
    collection(db, COL),
    where('authorUid', '==', uid),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as DesertStory))
    .filter((s) => !s.isDeleted)
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
};
