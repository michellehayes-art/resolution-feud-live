import { SurveyAnswer } from '../types/game';

// Clean text for string comparison
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'about',
  'of', 'is', 'it', 'that', 'this', 'you', 'your', 'we', 'our', 'them', 'they', 'my',
  'just', 'do', 'don', 't', 's', 've', 're',
]);

export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

// Check local match between contestant guess and survey answer
export function checkLocalMatch(
  guess: string,
  answers: SurveyAnswer[]
): { matched: boolean; index: number; answer?: SurveyAnswer } {
  const normGuess = normalizeText(guess);
  if (!normGuess) return { matched: false, index: -1 };

  const guessWords = extractKeywords(guess);

  // Exact or synonym match first
  for (let i = 0; i < answers.length; i++) {
    const ans = answers[i];
    if (ans.isRevealed) continue;

    const normAnsText = normalizeText(ans.text);

    // Direct substring or inclusion
    if (normAnsText.includes(normGuess) || normGuess.includes(normAnsText)) {
      return { matched: true, index: i, answer: ans };
    }

    // Check synonyms
    if (ans.synonyms) {
      for (const syn of ans.synonyms) {
        const normSyn = normalizeText(syn);
        if (normSyn.includes(normGuess) || normGuess.includes(normSyn)) {
          return { matched: true, index: i, answer: ans };
        }

        // Word overlap with synonym
        const synWords = extractKeywords(syn);
        const overlap = guessWords.filter((w) => synWords.includes(w));
        if (overlap.length >= 2 || (overlap.length === 1 && synWords.length <= 2 && guessWords.length <= 2)) {
          return { matched: true, index: i, answer: ans };
        }
      }
    }

    // Word overlap with main answer text
    const ansWords = extractKeywords(ans.text);
    const overlapWithMain = guessWords.filter((w) => ansWords.includes(w));
    if (
      overlapWithMain.length >= 2 ||
      (overlapWithMain.length === 1 && ansWords.length <= 3 && guessWords.length <= 2)
    ) {
      return { matched: true, index: i, answer: ans };
    }
  }

  return { matched: false, index: -1 };
}

// Request AI semantic match from backend
export async function checkAiSemanticMatch(
  guess: string,
  unrevealedAnswers: SurveyAnswer[],
  question: string
): Promise<{ matched: boolean; index: number; explanation?: string }> {
  try {
    const res = await fetch('/api/match-guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guess,
        unrevealedAnswers: unrevealedAnswers.map((a) => ({
          text: a.text,
          synonyms: a.synonyms,
        })),
        question,
      }),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return {
      matched: !!data.matched && data.matchedIndex >= 0,
      index: data.matchedIndex ?? -1,
      explanation: data.explanation,
    };
  } catch (err) {
    console.warn('AI semantic match request skipped, relying on local match:', err);
    return { matched: false, index: -1 };
  }
}
