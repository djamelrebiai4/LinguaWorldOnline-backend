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
export interface ScoreStore {
    record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void;
    top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[];
}
export declare class MemoryScoreStore implements ScoreStore {
    private entries;
    record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void;
    top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[];
}
export declare class FileScoreStore implements ScoreStore {
    private readonly path;
    private entries;
    constructor(filePath?: string);
    private load;
    private save;
    record(entry: Omit<ScoreEntry, 'date' | 'timestamp'>): void;
    top(game: string, period: 'daily' | 'all', limit: number): LeaderboardEntry[];
}
export declare function createScoreStore(): ScoreStore;
//# sourceMappingURL=store.d.ts.map