import { useState, useEffect } from 'react';
import { UserProfile, AICompatibilityResult } from '../types';

// Generators for pseudo-dynamic content
const getInsights = (userName: string, matchName: string) => [
  `${userName}, your analytical nature blends interestingly with ${matchName}'s creative vibes.`,
  `Both you and ${matchName} seem to value deep connections over small talk.`,
  `${matchName}'s adventurous spirit might just be the spark you need, ${userName}.`,
  `High compatibility detected! ${userName} and ${matchName} share key core values.`,
  `Opposites attract: ${userName}'s calm complements ${matchName}'s energy.`,
];

const getIcebreakers = (matchInterest: string) => [
  `I see you're into ${matchInterest}. What's your favorite thing about it?`,
  `If we could go do something related to ${matchInterest} right now, what would it be?`,
  `Rank these from 1-10: Pizza, ${matchInterest}, and sleep. Go!`,
  `I bet you have a great story about ${matchInterest}. Care to share?`,
  `How did you first get interested in ${matchInterest}?`
];

export const useVantageAI = (currentUser: UserProfile, targetProfile: UserProfile | null) => {
  const [data, setData] = useState<AICompatibilityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetProfile || !currentUser) {
      setData(null);
      return;
    }

    const fetchInsight = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // SIMULATION: Simulating an API call to Gemini/DeepSeek
        // In production, this would use the `geminiService` to call `generateContent`
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s artificial delay for "AI Thinking"

        // Generate semi-random but consistent data based on name length
        const randomScore = 65 + (targetProfile.name.length * 3) % 30;
        
        // Pick dynamic text
        const insights = getInsights(currentUser.name, targetProfile.name);
        const randomInsight = insights[(currentUser.name.length + targetProfile.name.length) % insights.length];
        
        const primaryInterest = targetProfile.interests[0] || 'Life';
        const icebreakers = getIcebreakers(primaryInterest);
        const randomIcebreaker = icebreakers[targetProfile.name.length % icebreakers.length];

        const result: AICompatibilityResult = {
          score: Math.min(99, randomScore),
          insight: randomInsight,
          icebreaker: randomIcebreaker
        };

        setData(result);
      } catch (err) {
        console.error("AI Service Error:", err);
        setError("Failed to analyze compatibility.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();

  }, [targetProfile?.id, currentUser?.id]); 

  return { data, loading, error };
};