import { type GameContext, type GameSnapshot, type Room } from './protocol';
export declare function snapshotGame(room: Room): GameSnapshot | null;
export declare function startGame(room: Room, ctx: GameContext, hostId: string, mode: string): {
    ok: boolean;
    error?: string;
};
export declare function handleGameMessage(room: Room, ctx: GameContext, playerId: string, message: Record<string, unknown>): void;
export declare function tickGame(room: Room, ctx: GameContext, now: number): void;
export declare function endGame(room: Room, ctx: GameContext, reason: string): void;
export declare function removeFromGame(room: Room, ctx: GameContext, playerId: string): void;
export declare function invitePositions(room: Room): Record<string, {
    x: number;
    z: number;
}>;
export declare function huntSpawnIds(): string[];
export declare function huntItemFor(spawnId: string): import("./content").HuntItem | undefined;
//# sourceMappingURL=games.d.ts.map