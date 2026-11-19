"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_ACTION_COOLDOWN_MS = exports.EMOTE_COOLDOWN_MS = exports.PRIVATE_CHAT_DISTANCE = exports.MAX_TITLE_LENGTH = exports.MAX_MESSAGE_LENGTH = exports.MAX_NAME_LENGTH = exports.MAX_GAME_PLAYERS = exports.MAX_PLAYERS_PER_ROOM = exports.WEATHER_TYPES = exports.PLAYER_MODELS = exports.GAME_MODES = exports.EMOTES = void 0;
exports.EMOTES = new Set([
    'wave',
    'dance',
    'laugh',
    'point',
    'cheer',
    'spin'
]);
exports.GAME_MODES = new Set([
    'hunt',
    'tag',
    'hide',
    'quiz'
]);
exports.PLAYER_MODELS = new Set([
    'Barbarian',
    'Knight',
    'Mage',
    'Ranger',
    'Rogue'
]);
exports.WEATHER_TYPES = new Set([
    'clear',
    'rain',
    'snow',
    'fog'
]);
exports.MAX_PLAYERS_PER_ROOM = 32;
exports.MAX_GAME_PLAYERS = 12;
exports.MAX_NAME_LENGTH = 24;
exports.MAX_MESSAGE_LENGTH = 240;
exports.MAX_TITLE_LENGTH = 40;
exports.PRIVATE_CHAT_DISTANCE = 8;
exports.EMOTE_COOLDOWN_MS = 1500;
exports.GAME_ACTION_COOLDOWN_MS = 250;
