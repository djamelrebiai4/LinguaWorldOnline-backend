export type GameMode = 'hunt' | 'tag' | 'hide' | 'quiz';

export type EmoteName = 'wave' | 'dance' | 'laugh' | 'point' | 'cheer' | 'spin';

export const EMOTES: ReadonlySet<string> = new Set<EmoteName>([
  'wave',
  'dance',
  'laugh',
  'point',
  'cheer',
  'spin'
]);

export const GAME_MODES: ReadonlySet<string> = new Set<GameMode>([
  'hunt',
  'tag',
  'hide',
  'quiz'
]);

export const PLAYER_MODELS: ReadonlySet<string> = new Set([
  'Barbarian',
  'Knight',
  'Mage',
  'Ranger',
  'Rogue'
]);

export const WEATHER_TYPES: ReadonlySet<string> = new Set([
  'clear',
  'rain',
  'snow',
  'fog'
]);

export const MAX_PLAYERS_PER_ROOM = 32;
export const MAX_GAME_PLAYERS = 12;
export const MAX_NAME_LENGTH = 24;
export const MAX_MESSAGE_LENGTH = 240;
export const MAX_TITLE_LENGTH = 40;
export const PRIVATE_CHAT_DISTANCE = 8;
export const EMOTE_COOLDOWN_MS = 1500;
export const GAME_ACTION_COOLDOWN_MS = 250;

export type ChatLanguage = 'de' | 'ar' | 'en';
export type PlayerRole =
  | 'spieler'
  | 'it'
  | 'runner'
  | 'seeker'
  | 'hider'
  | 'found'
  | 'spectator';

export type WorldState = {
  seed: string;
  dayIndex: number;
  minuteOfDay: number;
  weather: string;
  updatedAt: number;
};

export type Player = {
  id: string;
  playerKey: string;
  name: string;
  room: string;
  x: number;
  z: number;
  heading: number;
  model: string;
  voiceEnabled: boolean;
  transmitting: boolean;
  muted: boolean;
  ready: boolean;
  score: number;
  role: PlayerRole;
  title: string;
  lang: ChatLanguage;
  joinedAt: number;
  lastPositionAt: number;
  lastChatAt: number;
  lastPrivateChatAt: number;
  lastEmoteAt: number;
  lastGameActionAt: number;
};

export type PublicPlayer = Omit<
  Player,
  | 'playerKey'
  | 'joinedAt'
  | 'lastPositionAt'
  | 'lastChatAt'
  | 'lastPrivateChatAt'
  | 'lastEmoteAt'
  | 'lastGameActionAt'
>;

export type CoopQuestTask = {
  key: string;
  de: string;
  article?: string;
  completed: boolean;
  by?: string;
};

export type CoopQuestState = {
  id: string;
  title: string;
  tasks: CoopQuestTask[];
  contributors: Record<string, number>;
  completedAt?: number;
};

export type GameState = {
  mode: GameMode;
  phase: 'countdown' | 'hiding' | 'playing' | 'question' | 'reveal' | 'ended';
  roundId: string;
  hostId: string;
  startedAt: number;
  phaseEndsAt: number;
  endsAt: number;
  participants: Set<string>;
  roles: Map<string, PlayerRole>;
  scores: Map<string, number>;
  data: Record<string, any>;
};

export type Room = {
  id: string;
  level: string;
  hostId: string;
  players: Map<string, Player>;
  sockets: Map<string, import('ws').WebSocket>;
  game: GameState | null;
  quest: CoopQuestState;
  world: WorldState;
  createdAt: number;
};

export type GameContext = {
  now: () => number;
  broadcast: (payload: object) => void;
  sendTo: (playerId: string, payload: object) => void;
  endGame: (reason: string) => void;
  recordScores: (mode: GameMode, scores: Array<{ playerKey: string; name: string; score: number }>) => void;
  teleportAll: (positions: Record<string, { x: number; z: number }>) => void;
  setRole: (playerId: string, role: PlayerRole) => void;
  setScore: (playerId: string, score: number) => void;
};

export type GameSnapshot = {
  game: GameMode;
  phase: GameState['phase'];
  roundId: string;
  hostId: string;
  startedAt: number;
  endsAt: number;
  phaseEndsAt: number;
  participants: string[];
  roles: Record<string, PlayerRole>;
  scoreboard: Array<{
    id: string;
    name: string;
    score: number;
    role: PlayerRole;
    title: string;
  }>;
  hunt?: {
    remaining: number;
    total: number;
    spawns: Array<{
      id: string;
      x: number;
      z: number;
      de: string;
      article?: string;
      example?: string;
      claimedBy?: string;
    }>;
  };
  tag?: {
    mode: 'tag' | 'hide';
    itId?: string;
    seekerId?: string;
    foundIds: string[];
    hidingUntil?: number;
  };
  quiz?: {
    questionIndex: number;
    totalQuestions: number;
    answeredCount: number;
    question?: {
      id: string;
      prompt: string;
      options: string[];
    };
  };
};
