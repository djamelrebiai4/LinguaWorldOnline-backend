import type { CoopQuestState } from './protocol';
export type HuntItem = {
    de: string;
    article?: string;
    example?: string;
};
export declare const HUNT_ITEMS: Record<string, HuntItem>;
export declare const HUNT_SPAWNS: Array<{
    id: string;
    x: number;
    z: number;
    key: string;
}>;
export declare const HUNT_CONFIG: {
    durationMs: number;
    collectDistance: number;
    pointsPerItem: number;
    maxItems: number;
};
export declare const TAG_CONFIG: {
    minPlayers: number;
    maxPlayers: number;
    countdownMs: number;
    roundMs: number;
    hidePhaseMs: number;
    tagDistance: number;
    immunityMs: number;
    actionCooldownMs: number;
    spawnRadius: number;
};
export type QuizQuestion = {
    id: string;
    kind: 'artikel' | 'lueckentext' | 'bedeutung';
    prompt: string;
    options: string[];
    correctIndex: number;
};
export declare const QUIZ_BANK: QuizQuestion[];
export declare const QUIZ_CONFIG: {
    questionsPerRound: number;
    questionMs: number;
    revealMs: number;
    points: number[];
};
export declare const COOP_QUESTS: Record<string, Omit<CoopQuestState, 'contributors'>>;
export declare const LEVEL_NAMES: Record<string, string>;
export declare function getCoopQuest(level: string): CoopQuestState;
export declare function buildHuntSpawns(): Array<{
    id: string;
    x: number;
    z: number;
    de: string;
    article?: string;
    example?: string;
    key: string;
}>;
//# sourceMappingURL=content.d.ts.map