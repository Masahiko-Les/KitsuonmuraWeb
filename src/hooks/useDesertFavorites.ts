import { useState, useEffect } from 'react';
import { DesertStory } from '../types/desertStory';
import { getMyFavoriteStories } from '../services/desertFavoriteService';

export const useDesertFavorites = (userUid?: string) => {
  const [stories, setStories] = useState<DesertStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userUid) return;
    setLoading(true);
    setError(null);
    getMyFavoriteStories(userUid)
      .then(setStories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userUid]);

  return { stories, loading, error };
};
