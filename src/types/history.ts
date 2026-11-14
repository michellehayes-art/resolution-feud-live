import { GameMode } from './game';

export interface GameSessionRecord {
  id: string;
  timestamp: number;
  dateStr: string;
  mode: GameMode;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  fastMoneyScore: number;
  totalPoints: number;
  winnerName: string;
  winnerId: 1 | 2 | 'TIE';
}
