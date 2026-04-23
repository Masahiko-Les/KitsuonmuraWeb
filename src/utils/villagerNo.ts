export const formatVillagerNo = (num: number): string =>
  `村人No.${String(num).padStart(5, '0')}`;
