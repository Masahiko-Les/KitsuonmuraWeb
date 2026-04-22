import { useState, useEffect, useCallback } from 'react';
import { DesertStory } from '../types/desertStory';
import { getMyStories } from '../services/desertStoryService';

export const useDesertMyStories = (userUid?: string) => {
  const [stories, setStories] = useState<DesertStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userUid) return;
    setLoading(true);
    setError(null);
    getMyStories(userUid)
      .then(setStories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userUid]);

  useEffect(() => {
    load();
  }, [load]);

  return { stories, setStories, loading, error, reload: load };
};
