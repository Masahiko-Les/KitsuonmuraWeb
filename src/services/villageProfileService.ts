import { supabase } from '../supabase/client';
import { StutterType, VillageProfile } from '../types/villageProfile';

interface SaveInput {
  uid: string;
  email: string;
  nickname: string;
  stutterType: StutterType;
  stutterTypeOther: string;
  difficultSoundsTop3: [string, string, string];
}

const mapVillager = (row: Record<string, unknown>): VillageProfile => ({
  uid: row.uid as string,
  email: row.email as string | undefined,
  nickname: row.nickname as string,
  villagerNo: row.villager_no as string,
  villagerNoNumeric: row.villager_no_numeric as number,
  stutterType: row.stutter_type as StutterType,
  stutterTypeOther: row.stutter_type_other as string,
  difficultSoundsTop3: row.difficult_sounds_top3 as [string, string, string],
  villageProfileCompleted: row.village_profile_completed as boolean,
  agreedToTerms: row.agreed_to_terms as boolean,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const saveVillageProfile = async (input: SaveInput): Promise<void> => {
  const { error } = await supabase.rpc('save_village_profile', {
    p_uid: input.uid,
    p_stutter_type: input.stutterType,
    p_stutter_type_other: input.stutterTypeOther,
    p_difficult_sounds_top3: input.difficultSoundsTop3,
  });
  if (error) throw error;
};

export const getAllVillagers = async (): Promise<VillageProfile[]> => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('village_profile_completed', true)
    .order('villager_no_numeric', { ascending: true });
  return (data || []).map(mapVillager);
};
