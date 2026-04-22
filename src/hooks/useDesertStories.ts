import { useState, useEffect } from 'react';
import { DesertStory } from '../types/desertStory';
import { getPublishedStories } from '../services/desertStoryService';

export const useDesertStories = () => {
  const [stories, setStories] = useState<DesertStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublishedStories()
      .then(setStories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stories, loading, error };
};
