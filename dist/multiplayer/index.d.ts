import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { MAX_GAME_PLAYERS, type GameMode, type PlayerRole } from './protocol';
import { type ScoreStore } from './store';
type MultiplayerOptions = {
    frontendOrigin: string;
    authorizedDomains: string[];
    nodeEnv: string;
    store?: ScoreStore;
    worldSeed?: string;
};
export declare function attachMultiplayer(server: Server, options?: MultiplayerOptions): WebSocketServer;
export { MAX_GAME_PLAYERS };
export type { GameMode, PlayerRole };
//# sourceMappingURL=index.d.ts.map