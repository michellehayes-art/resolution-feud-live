export interface SurveyAnswer {
  id: string;
  text: string;
  points: number;
  synonyms: string[];
  isRevealed: boolean;
  revealedBy?: 1 | 2;
}

export interface FeudQuestion {
  id: string;
  category: 'Everyday Friction' | 'Communication & Feelings' | 'Home & Chores' | 'Money & Plans' | 'Family & Social' | 'Custom Dispute' | 'Spicy & Romance' | 'Intimacy & Dating';
  question: string;
  counselorTip: string;
  answers: SurveyAnswer[];
  edition?: 'classic' | 'romance';
}

export type GameMode = 'COUPLES' | 'ROMANCE' | 'SOLO_BOT' | 'PARTY';

export type GamePhase =
  | 'LOBBY'
  | 'FACE_OFF'
  | 'MAIN_ROUND'
  | 'STEAL_ROUND'
  | 'ROUND_DEBRIEF'
  | 'FAST_MONEY'
  | 'GAME_OVER';

export interface Team {
  id: 1 | 2;
  name: string;
  score: number;
  roundScore: number;
  strikes: number;
  avatarSeed?: string;
  avatar?: string;
}

export interface FastMoneyItem {
  prompt: string;
  userAnswer?: string;
  matchedText?: string;
  pointsEarned: number;
}
