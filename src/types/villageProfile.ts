export type StutterType = '難発' | '連発' | '伸発' | '混合' | 'その他';

export const STUTTER_TYPES: StutterType[] = ['難発', '連発', '伸発', '混合', 'その他'];

export interface VillageProfile {
  uid?: string;
  email?: string;
  nickname: string;
  villagerNo: string;
  villagerNoNumeric: number;
  stutterType: StutterType;
  stutterTypeOther: string;
  difficultSoundsTop3: [string, string, string];
  villageProfileCompleted: boolean;
  agreedToTerms: boolean;
  createdAt?: any;
  updatedAt?: any;
}
