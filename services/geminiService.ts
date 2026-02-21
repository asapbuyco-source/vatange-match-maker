/**
 * Gemini AI Service
 * Powers: AI compatibility scoring, icebreaker generation, conversation coach
 * API Docs: https://ai.google.dev/api/rest
 * Model: gemini-2.0-flash (fast, multimodal)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates?: {
        content: { parts: { text: string }[] };
        finishReason: string;
    }[];
    error?: { code: number; message: string; status: string };
}

const callGemini = async (prompt: string, history: GeminiMessage[] = []): Promise<string> => {
    if (!GEMINI_API_KEY) {
        console.warn('[Gemini] No API key set — using simulated response');
        return simulateFallback(prompt);
    }

    const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                ...history,
                { role: 'user', parts: [{ text: prompt }] }
            ],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 256,
                topP: 0.9,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.json() as GeminiResponse;
        throw new Error(err.error?.message || `Gemini HTTP error ${response.status}`);
    }

    const data = await response.json() as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return text.trim();
};

// ---- Compatibility Scoring ----
export interface CompatibilityResult {
    score: number;        // 0-100
    insight: string;      // Why they're compatible
    icebreaker: string;   // Opening message suggestion
}

export const getCompatibilityScore = async (
    userInterests: string[],
    matchInterests: string[],
    userBio: string,
    matchBio: string,
    language: 'en' | 'fr' = 'en',
): Promise<CompatibilityResult> => {
    const langNote = language === 'fr'
        ? 'IMPORTANT: Respond entirely in French.'
        : 'IMPORTANT: Respond entirely in English.';

    const prompt = `You are a dating app AI for Vantage Match in Cameroon. ${langNote}

Analyze the compatibility between these two people and respond ONLY in valid JSON (no markdown):
{
  "score": <integer 0-100>,
  "insight": "<30-word insight explaining compatibility>",
  "icebreaker": "<natural opening message from user to match, max 20 words>"
}

User interests: ${userInterests.join(', ')}
User bio: "${userBio}"
Match interests: ${matchInterests.join(', ')}
Match bio: "${matchBio}"`;

    try {
        const raw = await callGemini(prompt);
        const cleaned = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned) as CompatibilityResult;
    } catch {
        return simulateCompatibility(userInterests, matchInterests);
    }
};

// ---- Conversation Coach ----
export const getConversationSuggestion = async (
    matchName: string,
    chatHistory: { role: 'user' | 'model'; text: string }[],
    language: 'en' | 'fr' = 'en',
): Promise<string> => {
    const langNote = language === 'fr' ? 'Réponds en français.' : 'Reply in English.';
    const history: GeminiMessage[] = chatHistory.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));
    const prompt = `You are a friendly dating coach. ${langNote} Suggest a short, natural follow-up message (max 15 words) for a chat with ${matchName}. Just the message text, nothing else.`;
    try {
        return await callGemini(prompt, history);
    } catch {
        return language === 'fr' ? "Qu'est-ce que vous aimez faire le week-end ?" : 'What do you like to do on weekends?';
    }
};

// ---- Fallbacks (when API key isn't set) ----
const simulateCompatibility = (a: string[], b: string[]): CompatibilityResult => {
    const shared = a.filter(i => b.includes(i));
    const score = Math.min(95, 50 + shared.length * 14 + Math.floor(Math.random() * 15));
    return {
        score,
        insight: shared.length > 0
            ? `You both love ${shared[0]}. That's a great starting point for connection.`
            : 'Opposites attract — you bring different worlds together.',
        icebreaker: `Hey! I noticed we both enjoy ${shared[0] || 'interesting things'} — what's your take on it?`,
    };
};

const simulateFallback = async (prompt: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 600));
    if (prompt.includes('score')) {
        return JSON.stringify({ score: 78, insight: 'Great shared interests and compatible energy.', icebreaker: 'Hey! I love your taste in music — what are you listening to lately?' });
    }
    return "What's the best place you've visited in Cameroon?";
};
