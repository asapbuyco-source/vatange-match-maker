import { useState, useEffect, useRef } from 'react';
import { UserProfile, AICompatibilityResult } from '../types';
import { getCompatibilityScore } from '../services/geminiService';

export const useAmouraAI = (
  currentUser: UserProfile | null,
  targetProfile: UserProfile | null,
  language: 'en' | 'fr' | 'pcm' = 'en',
) => {
  const [data, setData] = useState<AICompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!currentUser || !targetProfile) {
      setData(null);
      return;
    }

    // Cancel any in-flight request for a previous profile
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCompatibilityScore(
          currentUser.interests,
          targetProfile.interests,
          currentUser.bio,
          targetProfile.bio,
          language,
        );

        if (!controller.signal.aborted) {
          setData({
            score: result.score,
            insight: result.insight,
            icebreaker: result.icebreaker,
          });
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          const msg = err instanceof Error ? err.message : 'AI scoring failed';
          setError(msg);
          // Still provide a fallback result so UI can render
          const shared = currentUser.interests.filter(i => targetProfile.interests.includes(i));
          const score = Math.min(95, 50 + shared.length * 14 + Math.floor(Math.random() * 15));
          setData({
            score,
            insight: shared.length > 0
              ? `You both love ${shared[0]}. A great foundation for connection.`
              : 'Different backgrounds can spark the best connections.',
            icebreaker: language === 'fr'
              ? `Salut ${targetProfile.name}! On a des intérêts en commun, tu veux en parler ?`
              : `Hey ${targetProfile.name}! I noticed we have a lot in common — would love to chat!`,
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();

    return () => { controller.abort(); };
  }, [currentUser?.id, targetProfile?.id, language]);

  return { data, loading, error };
};