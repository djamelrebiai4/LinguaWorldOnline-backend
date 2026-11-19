"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScoreStore = exports.MemoryScoreStore = void 0;
exports.createScoreStore = createScoreStore;
const fs_1 = require("fs");
const path_1 = require("path");
function todayKey(timestamp = Date.now()) {
    return new Date(timestamp).toISOString().slice(0, 10);
}
class MemoryScoreStore {
    constructor() {
        this.entries = [];
    }
    record(entry) {
        const timestamp = Date.now();
        this.entries.push({ ...entry, date: todayKey(timestamp), timestamp });
    }
    top(game, period, limit) {
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
exports.MemoryScoreStore = MemoryScoreStore;
class FileScoreStore {
    constructor(filePath) {
        this.entries = [];
        this.path = filePath || (0, path_1.resolve)(__dirname, '..', '..', 'data', 'multiplayer-scores.json');
        this.load();
    }
    load() {
        try {
            if (!(0, fs_1.existsSync)(this.path))
                return;
            const raw = JSON.parse((0, fs_1.readFileSync)(this.path, 'utf8'));
            if (Array.isArray(raw?.scores)) {
                this.entries = raw.scores.filter((entry) => {
                    if (!entry || typeof entry !== 'object')
                        return false;
                    const item = entry;
                    return typeof item.game === 'string'
                        && typeof item.playerKey === 'string'
                        && typeof item.name === 'string'
                        && typeof item.score === 'number'
                        && typeof item.date === 'string'
                        && typeof item.timestamp === 'number';
                });
            }
        }
        catch (error) {
            console.warn('[multiplayer] Leaderboard konnte nicht geladen werden.', error);
        }
    }
    save() {
        try {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(this.path), { recursive: true });
            (0, fs_1.writeFileSync)(this.path, JSON.stringify({ scores: this.entries.slice(-1500) }, null, 2));
        }
        catch (error) {
            console.warn('[multiplayer] Leaderboard konnte nicht gespeichert werden.', error);
        }
    }
    record(entry) {
        const timestamp = Date.now();
        this.entries.push({ ...entry, date: todayKey(timestamp), timestamp });
        this.entries = this.entries.slice(-1500);
        this.save();
    }
    top(game, period, limit) {
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
exports.FileScoreStore = FileScoreStore;
function createScoreStore() {
    if (process.env.MULTIPLAYER_STORE === 'memory')
        return new MemoryScoreStore();
    return new FileScoreStore(process.env.MULTIPLAYER_SCORE_FILE);
}
