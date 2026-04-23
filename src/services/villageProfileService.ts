import {
  doc,
  getDocs,
  collection,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatVillagerNo } from '../utils/villagerNo';
import { StutterType, VillageProfile } from '../types/villageProfile';

interface SaveInput {
  uid: string;
  email: string;
  nickname: string;
  stutterType: StutterType;
  stutterTypeOther: string;
  difficultSoundsTop3: [string, string, string];
}

export const saveVillageProfile = async (input: SaveInput): Promise<void> => {
  const counterRef = doc(db, 'counters', 'villagerCounter');
  const userRef = doc(db, 'users', input.uid);

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const lastNumber = counterSnap.exists()
      ? (counterSnap.data().lastNumber as number)
      : 0;
    const newNumber = lastNumber + 1;

    tx.set(counterRef, { lastNumber: newNumber });
    tx.set(
      userRef,
      {
        stutterType: input.stutterType,
        stutterTypeOther: input.stutterTypeOther,
        difficultSoundsTop3: input.difficultSoundsTop3,
        villagerNoNumeric: newNumber,
        villagerNo: formatVillagerNo(newNumber),
        villageProfileCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
};

export const getAllVillagers = async (): Promise<VillageProfile[]> => {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('villageProfileCompleted', '==', true),
    ),
  );
  return snap.docs
    .map((d) => d.data() as VillageProfile)
    .sort((a, b) => (a.villagerNoNumeric ?? 0) - (b.villagerNoNumeric ?? 0));
};
