import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

export type ScoreEntry = {
  game: string;
  playerKey: string;
  name: string;
  score: number;
  date: string;
  timestamp: number;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  date: string;
};

function todayKey(timestamp = Date.now()): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export interface ScoreStore {
  record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void;
  top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[];
}

export class MemoryScoreStore implements ScoreStore {
  private entries: ScoreEntry[] = [];

  record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void {
    const timestamp = Date.now();
    this.entries.push({ ...entry, date: todayKey(timestamp), timestamp });
  }

  top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[] {
    const today = todayKey();
    return this.entries
      .filter((entry) => entry.game === game && (period === 'all' || entry.date === today))
      .sort((first, second) => second.score - first.score || first.timestamp - second.timestamp)
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.score,
        date: entry.date
      }));
  }
}

export class FileScoreStore implements ScoreStore {
  private readonly path: string;
  private entries: ScoreEntry[] = [];

  constructor(filePath?: string) {
    this.path = filePath || resolve(__dirname, '..', '..', 'data', 'multiplayer-scores.json');
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const raw = JSON.parse(readFileSync(this.path, 'utf8'));
      if (Array.isArray(raw?.scores)) {
        this.entries = raw.scores.filter((entry: unknown) => {
          if (!entry || typeof entry !== 'object') return false;
          const item = entry as Record<string, unknown>;
          return typeof item.game === 'string'
            && typeof item.playerKey === 'string'
            && typeof item.name === 'string'
            && typeof item.score === 'number'
            && typeof item.date === 'string'
            && typeof item.timestamp === 'number';
        });
      }
    } catch (error) {
      console.warn('[multiplayer] Leaderboard konnte nicht geladen werden.', error);
    }
  }

  private save(): void {
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      writeFileSync(this.path, JSON.stringify({ scores: this.entries.slice(-1500) }, null, 2));
    } catch (error) {
      console.warn('[multiplayer] Leaderboard konnte nicht gespeichert werden.', error);
    }
  }

  record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void {
    const timestamp = Date.now();
    this.entries.push({ ...entry, date: todayKey(timestamp), timestamp });
    this.entries = this.entries.slice(-1500);
    this.save();
  }

  top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[] {
    const today = todayKey();
    return this.entries
      .filter((entry) => entry.game === game && (period === 'all' || entry.date === today))
      .sort((first, second) => second.score - first.score || first.timestamp - second.timestamp)
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        score: entry.score,
        date: entry.date
      }));
  }
}

export function createScoreStore(): ScoreStore {
  if (process.env.MULTIPLAYER_STORE === 'memory') return new MemoryScoreStore();
  return new FileScoreStore(process.env.MULTIPLAYER_SCORE_FILE);
}
