import { useState, useEffect } from 'react';
import { DesertStory } from '../types/desertStory';
import { getStoryById } from '../services/desertStoryService';
import { checkWatered } from '../services/desertWaterService';
import { checkFavorited } from '../services/desertFavoriteService';

export const useDesertStoryDetail = (storyId: string, userUid?: string) => {
  const [story, setStory] = useState<DesertStory | null>(null);
  const [isWatered, setIsWatered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getStoryById(storyId),
      userUid ? checkWatered(storyId, userUid) : Promise.resolve(false),
      userUid ? checkFavorited(storyId, userUid) : Promise.resolve(false),
    ])
      .then(([s, watered, faved]) => {
        setStory(s);
        setIsWatered(watered);
        setIsFavorited(faved);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [storyId, userUid]);

  return { story, isWatered, setIsWatered, isFavorited, setIsFavorited, loading, error };
};
