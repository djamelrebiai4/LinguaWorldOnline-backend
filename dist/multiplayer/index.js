"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_GAME_PLAYERS = void 0;
exports.attachMultiplayer = attachMultiplayer;
const crypto_1 = require("crypto");
const ws_1 = require("ws");
const protocol_1 = require("./protocol");
Object.defineProperty(exports, "MAX_GAME_PLAYERS", { enumerable: true, get: function () { return protocol_1.MAX_GAME_PLAYERS; } });
const content_1 = require("./content");
const games_1 = require("./games");
const store_1 = require("./store");
function send(socket, payload) {
    if (socket.readyState === ws_1.WebSocket.OPEN)
        socket.send(JSON.stringify(payload));
}
function safeName(value) {
    if (typeof value !== 'string')
        return 'Spieler';
    const name = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, protocol_1.MAX_NAME_LENGTH);
    return name || 'Spieler';
}
function safeModel(value) {
    return typeof value === 'string' && protocol_1.PLAYER_MODELS.has(value) ? value : 'Ranger';
}
function safeTitle(value) {
    if (typeof value !== 'string')
        return '';
    return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, protocol_1.MAX_TITLE_LENGTH);
}
function safePlayerKey(value) {
    if (typeof value !== 'string')
        return `gast-${(0, crypto_1.randomUUID)()}`;
    const key = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    return key || `gast-${(0, crypto_1.randomUUID)()}`;
}
function safeLanguage(value) {
    return value === 'ar' || value === 'en' ? value : 'de';
}
function publicPlayer(player) {
    return {
        id: player.id,
        name: player.name,
        room: player.room,
        x: player.x,
        z: player.z,
        heading: player.heading,
        model: player.model,
        voiceEnabled: player.voiceEnabled,
        transmitting: player.transmitting,
        muted: player.muted,
        ready: player.ready,
        score: player.score,
        role: player.role,
        title: player.title,
        lang: player.lang
    };
}
function currentWorld(seed) {
    const now = new Date();
    return {
        seed,
        dayIndex: Math.floor(now.getTime() / 86400000),
        minuteOfDay: now.getHours() * 60 + now.getMinutes(),
        weather: 'clear',
        updatedAt: now.getTime()
    };
}
function isAllowedOrigin(origin, options) {
    if (!origin)
        return true;
    if (origin === options.frontendOrigin || options.authorizedDomains.includes(origin))
        return true;
    return options.nodeEnv !== 'production';
}
function attachMultiplayer(server, options = { frontendOrigin: '', authorizedDomains: [], nodeEnv: 'development' }) {
    const webSocketServer = new ws_1.WebSocketServer({ noServer: true, maxPayload: 8192 });
    const sessions = new Map();
    const rooms = new Map();
    const store = options.store || (0, store_1.createScoreStore)();
    const worldSeed = options.worldSeed || process.env.MULTIPLAYER_WORLD_SEED || 'linguaworld-town-v1';
    const sendTo = (room, playerId, payload) => {
        const socket = room.sockets.get(playerId);
        if (socket)
            send(socket, payload);
    };
    const broadcastRoom = (room, payload, exceptId) => {
        for (const [playerId, socket] of room.sockets.entries()) {
            if (playerId !== exceptId)
                send(socket, payload);
        }
    };
    const broadcastAll = (payload) => {
        for (const room of rooms.values())
            broadcastRoom(room, payload);
    };
    const createContext = (room) => {
        const context = {
            now: () => Date.now(),
            broadcast: (payload) => broadcastRoom(room, payload),
            sendTo: (playerId, payload) => sendTo(room, playerId, payload),
            endGame: (reason) => (0, games_1.endGame)(room, context, reason),
            recordScores: (mode, scores) => {
                for (const entry of scores) {
                    store.record({
                        game: mode,
                        playerKey: entry.playerKey,
                        name: entry.name,
                        score: entry.score
                    });
                }
            },
            teleportAll: (positions) => {
                const now = Date.now();
                const payload = {};
                for (const [playerId, position] of Object.entries(positions)) {
                    const player = room.players.get(playerId);
                    if (!player)
                        continue;
                    player.x = position.x;
                    player.z = position.z;
                    player.lastPositionAt = now;
                    payload[playerId] = position;
                    sendTo(room, playerId, {
                        type: 'game:teleport',
                        x: position.x,
                        z: position.z
                    });
                }
                broadcastRoom(room, { type: 'game:positions', positions: payload });
            },
            setRole: (playerId, role) => {
                const player = room.players.get(playerId);
                if (!player)
                    return;
                player.role = role;
                broadcastRoom(room, { type: 'player-updated', player: publicPlayer(player) });
            },
            setScore: (playerId, score) => {
                const player = room.players.get(playerId);
                if (!player)
                    return;
                player.score = score;
            }
        };
        return context;
    };
    const broadcastQuest = (room) => {
        broadcastRoom(room, {
            type: 'quest:state',
            quest: {
                id: room.quest.id,
                title: room.quest.title,
                tasks: room.quest.tasks.map((task) => ({
                    key: task.key,
                    de: task.de,
                    article: task.article,
                    completed: task.completed,
                    by: task.by
                })),
                contributors: room.quest.contributors,
                completedAt: room.quest.completedAt
            }
        });
    };
    const getOrCreateRoom = (roomId) => {
        const existing = rooms.get(roomId);
        if (existing)
            return existing;
        const room = {
            id: roomId,
            level: roomId,
            hostId: '',
            players: new Map(),
            sockets: new Map(),
            game: null,
            quest: (0, content_1.getCoopQuest)(roomId),
            world: currentWorld(worldSeed),
            createdAt: Date.now()
        };
        rooms.set(roomId, room);
        return room;
    };
    const transferHost = (room) => {
        if (room.players.size === 0) {
            room.hostId = '';
            return;
        }
        if (room.hostId && room.players.has(room.hostId))
            return;
        const next = [...room.players.values()].sort((first, second) => first.joinedAt - second.joinedAt)[0];
        room.hostId = next.id;
        if (room.game)
            room.game.hostId = next.id;
        broadcastRoom(room, { type: 'room:state', hostId: room.hostId, playerCount: room.players.size });
    };
    const handleQuestCollect = (room, player, key) => {
        const normalized = key.toLowerCase().trim();
        if (!normalized)
            return;
        const task = room.quest.tasks.find((entry) => entry.key.toLowerCase() === normalized);
        if (!task || task.completed)
            return;
        task.completed = true;
        task.by = player.name;
        room.quest.contributors[player.id] = (room.quest.contributors[player.id] || 0) + 1;
        broadcastQuest(room);
        if (room.quest.tasks.every((entry) => entry.completed) && !room.quest.completedAt) {
            room.quest.completedAt = Date.now();
            broadcastRoom(room, {
                type: 'quest:completed',
                questId: room.quest.id,
                title: room.quest.title,
                rewardXP: 150
            });
            broadcastQuest(room);
        }
    };
    server.on('upgrade', (request, socket, head) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (pathname !== '/multiplayer')
            return;
        if (!isAllowedOrigin(request.headers.origin, options)) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
        }
        webSocketServer.handleUpgrade(request, socket, head, (client) => {
            webSocketServer.emit('connection', client, request);
        });
    });
    webSocketServer.on('connection', (client) => {
        client.on('message', (raw) => {
            let message;
            try {
                message = JSON.parse(raw.toString());
            }
            catch {
                send(client, { type: 'error', message: 'Ungültige Nachricht.' });
                return;
            }
            let session = sessions.get(client);
            if (!session && message.type === 'join') {
                const roomId = typeof message.room === 'string' ? message.room : '';
                if (!/^[1-5]$/.test(roomId)) {
                    send(client, { type: 'error', message: 'Ungültiger Spielraum.' });
                    client.close(1008, 'Ungültiger Spielraum');
                    return;
                }
                const room = getOrCreateRoom(roomId);
                if (room.players.size >= protocol_1.MAX_PLAYERS_PER_ROOM) {
                    send(client, { type: 'error', message: 'Dieser Raum ist voll.' });
                    client.close(1013, 'Raum voll');
                    return;
                }
                const now = Date.now();
                session = {
                    id: (0, crypto_1.randomUUID)(),
                    playerKey: safePlayerKey(message.playerKey),
                    name: safeName(message.name),
                    room: roomId,
                    x: roomId === '1' ? 30 : 0,
                    z: roomId === '1' ? 95 : 0,
                    heading: 0,
                    model: safeModel(message.model),
                    voiceEnabled: false,
                    transmitting: false,
                    muted: false,
                    ready: false,
                    score: 0,
                    role: room.game && room.game.phase !== 'ended' ? 'spectator' : 'spieler',
                    title: safeTitle(message.title),
                    lang: safeLanguage(message.lang),
                    joinedAt: now,
                    lastPositionAt: 0,
                    lastChatAt: 0,
                    lastPrivateChatAt: 0,
                    lastEmoteAt: 0,
                    lastGameActionAt: 0
                };
                sessions.set(client, session);
                room.players.set(session.id, session);
                room.sockets.set(session.id, client);
                if (!room.hostId)
                    room.hostId = session.id;
                send(client, {
                    type: 'welcome',
                    protocol: 2,
                    id: session.id,
                    self: publicPlayer(session),
                    players: [...room.players.values()]
                        .filter((player) => player.id !== session?.id)
                        .map(publicPlayer),
                    hostId: room.hostId,
                    features: ['emotes', 'hunt', 'tag', 'hide', 'quiz', 'quests', 'world-sync', 'voice-ptt'],
                    game: (0, games_1.snapshotGame)(room),
                    quest: {
                        id: room.quest.id,
                        title: room.quest.title,
                        tasks: room.quest.tasks,
                        contributors: room.quest.contributors,
                        completedAt: room.quest.completedAt
                    },
                    world: room.world
                });
                broadcastRoom(room, { type: 'player-joined', player: publicPlayer(session) }, session.id);
                broadcastRoom(room, {
                    type: 'room:state',
                    hostId: room.hostId,
                    playerCount: room.players.size,
                    level: room.level,
                    levelName: content_1.LEVEL_NAMES[room.level] || `Level ${room.level}`
                });
                return;
            }
            if (!session)
                return;
            const room = rooms.get(session.room);
            if (!room)
                return;
            if (message.type === 'rename') {
                session.name = safeName(message.name);
                broadcastRoom(room, { type: 'player-renamed', id: session.id, name: session.name });
                broadcastRoom(room, { type: 'player-updated', player: publicPlayer(session) });
                return;
            }
            if (message.type === 'customize') {
                session.name = safeName(message.name);
                session.model = safeModel(message.model);
                session.title = safeTitle(message.title ?? session.title);
                broadcastRoom(room, {
                    type: 'player-customized',
                    id: session.id,
                    name: session.name,
                    model: session.model,
                    title: session.title
                });
                broadcastRoom(room, { type: 'player-updated', player: publicPlayer(session) });
                return;
            }
            if (message.type === 'ready' && typeof message.ready === 'boolean') {
                session.ready = message.ready;
                broadcastRoom(room, { type: 'player-updated', player: publicPlayer(session) });
                return;
            }
            if (message.type === 'emote' && typeof message.emote === 'string' && protocol_1.EMOTES.has(message.emote)) {
                const now = Date.now();
                if (now - session.lastEmoteAt < protocol_1.EMOTE_COOLDOWN_MS)
                    return;
                session.lastEmoteAt = now;
                broadcastRoom(room, {
                    type: 'emote',
                    id: session.id,
                    name: session.name,
                    emote: message.emote,
                    duration: 2500
                });
                return;
            }
            if (message.type === 'voice-state') {
                const requestedEnabled = message.enabled === true;
                if (requestedEnabled && !session.voiceEnabled) {
                    const voiceCount = [...room.players.values()]
                        .filter((player) => player.voiceEnabled && player.id !== session.id).length;
                    if (voiceCount >= 7) {
                        send(client, { type: 'voice-error', message: 'Sprachchat ist auf 8 Personen pro Raum begrenzt.' });
                        return;
                    }
                }
                if (typeof message.enabled === 'boolean')
                    session.voiceEnabled = message.enabled;
                if (typeof message.transmitting === 'boolean')
                    session.transmitting = message.transmitting;
                if (typeof message.muted === 'boolean')
                    session.muted = message.muted;
                broadcastRoom(room, {
                    type: 'voice-state',
                    id: session.id,
                    name: session.name,
                    enabled: session.voiceEnabled,
                    transmitting: session.transmitting,
                    muted: session.muted
                });
                return;
            }
            if (message.type === 'signal' && typeof message.target === 'string'
                && message.signal && typeof message.signal === 'object') {
                const recipient = room.players.get(message.target);
                const recipientSocket = room.sockets.get(message.target);
                if (!recipient || !recipientSocket || !session.voiceEnabled || !recipient.voiceEnabled)
                    return;
                send(recipientSocket, {
                    type: 'signal',
                    from: session.id,
                    signal: message.signal
                });
                return;
            }
            if (message.type === 'position') {
                const { x, z, heading } = message;
                if (![x, z, heading].every((value) => typeof value === 'number' && Number.isFinite(value)))
                    return;
                const now = Date.now();
                const elapsed = now - session.lastPositionAt;
                if (elapsed < 75)
                    return;
                const nextX = Math.max(-1000, Math.min(1000, x));
                const nextZ = Math.max(-1000, Math.min(1000, z));
                if (room.game && room.game.phase !== 'ended' && room.game.participants.has(session.id)
                    && session.lastPositionAt > 0 && Math.hypot(nextX - session.x, nextZ - session.z) > Math.max(3.5, elapsed / 1000 * 28)) {
                    return;
                }
                session.lastPositionAt = now;
                session.x = nextX;
                session.z = nextZ;
                session.heading = Math.max(-360, Math.min(360, heading));
                broadcastRoom(room, { type: 'position', player: publicPlayer(session) }, session.id);
                return;
            }
            if (message.type === 'chat' && typeof message.text === 'string') {
                const text = message.text.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, protocol_1.MAX_MESSAGE_LENGTH);
                const now = Date.now();
                if (!text)
                    return;
                if (typeof message.target === 'string') {
                    if (now - session.lastPrivateChatAt < 600) {
                        send(client, { type: 'private-error', message: 'Warte kurz, bevor du eine weitere Nachricht sendest.' });
                        return;
                    }
                    const recipient = room.players.get(message.target);
                    const recipientSocket = room.sockets.get(message.target);
                    if (!recipient || !recipientSocket) {
                        send(client, { type: 'private-error', message: 'Dieser Spieler ist nicht mehr im Raum.' });
                        return;
                    }
                    const distance = Math.hypot(session.x - recipient.x, session.z - recipient.z);
                    if (distance > protocol_1.PRIVATE_CHAT_DISTANCE) {
                        send(client, { type: 'private-error', message: 'Komm näher, um einen privaten Chat zu öffnen.' });
                        return;
                    }
                    session.lastPrivateChatAt = now;
                    const privateMessage = {
                        type: 'private-chat',
                        id: session.id,
                        name: session.name,
                        target: recipient.id,
                        text,
                        timestamp: now
                    };
                    send(client, privateMessage);
                    send(recipientSocket, privateMessage);
                    return;
                }
                if (now - session.lastChatAt < 600)
                    return;
                session.lastChatAt = now;
                broadcastAll({
                    type: 'chat',
                    id: session.id,
                    name: session.name,
                    text,
                    timestamp: now
                });
                return;
            }
            if (message.type === 'game:start' && typeof message.game === 'string') {
                if (!protocol_1.GAME_MODES.has(message.game)) {
                    send(client, { type: 'game:error', message: 'Unbekanntes Spiel.' });
                    return;
                }
                const result = (0, games_1.startGame)(room, createContext(room), session.id, message.game);
                if (!result.ok)
                    send(client, { type: 'game:error', message: result.error || 'Das Spiel konnte nicht gestartet werden.' });
                return;
            }
            if (message.type === 'game:leave') {
                (0, games_1.removeFromGame)(room, createContext(room), session.id);
                broadcastRoom(room, { type: 'game:event', event: 'player:left', playerId: session.id, playerName: session.name });
                return;
            }
            if (message.type === 'hunt:collect' || message.type === 'tag:attempt' || message.type === 'quiz:answer') {
                (0, games_1.handleGameMessage)(room, createContext(room), session.id, message);
                return;
            }
            if (message.type === 'quest:collect' && typeof message.key === 'string') {
                handleQuestCollect(room, session, message.key);
                return;
            }
            if (message.type === 'world:sync') {
                send(client, { type: 'world:state', world: room.world });
                return;
            }
            if (message.type === 'world:set') {
                if (room.hostId !== session.id) {
                    send(client, { type: 'game:error', message: 'Nur der Gastgeber kann die Weltzeit ändern.' });
                    return;
                }
                if (typeof message.minuteOfDay === 'number' && Number.isFinite(message.minuteOfDay)) {
                    room.world.minuteOfDay = Math.max(0, Math.min(1439, Math.floor(message.minuteOfDay)));
                }
                if (typeof message.weather === 'string' && protocol_1.WEATHER_TYPES.has(message.weather)) {
                    room.world.weather = message.weather;
                }
                room.world.updatedAt = Date.now();
                broadcastRoom(room, { type: 'world:state', world: room.world });
                return;
            }
            if (message.type === 'leaderboard:get') {
                const game = typeof message.game === 'string' ? message.game : 'hunt';
                const period = message.period === 'all' ? 'all' : 'daily';
                send(client, {
                    type: 'leaderboard:data',
                    game,
                    period,
                    entries: store.top(game, period, 10)
                });
            }
        });
        client.on('close', () => {
            const session = sessions.get(client);
            if (!session)
                return;
            const room = rooms.get(session.room);
            sessions.delete(client);
            if (!room)
                return;
            (0, games_1.removeFromGame)(room, createContext(room), session.id);
            room.players.delete(session.id);
            room.sockets.delete(session.id);
            broadcastRoom(room, { type: 'player-left', id: session.id, name: session.name });
            if (room.players.size === 0) {
                rooms.delete(room.id);
            }
            else {
                transferHost(room);
                broadcastRoom(room, {
                    type: 'room:state',
                    hostId: room.hostId,
                    playerCount: room.players.size,
                    level: room.level,
                    levelName: content_1.LEVEL_NAMES[room.level] || `Level ${room.level}`
                });
            }
        });
    });
    const gameTimer = setInterval(() => {
        const now = Date.now();
        for (const room of rooms.values())
            (0, games_1.tickGame)(room, createContext(room), now);
    }, 500);
    gameTimer.unref?.();
    const worldTimer = setInterval(() => {
        for (const room of rooms.values()) {
            const now = new Date();
            room.world.dayIndex = Math.floor(now.getTime() / 86400000);
            room.world.minuteOfDay = now.getHours() * 60 + now.getMinutes();
            room.world.updatedAt = now.getTime();
            broadcastRoom(room, { type: 'world:state', world: room.world });
        }
    }, 60000);
    worldTimer.unref?.();
    webSocketServer.on('close', () => {
        clearInterval(gameTimer);
        clearInterval(worldTimer);
    });
    return webSocketServer;
}
