"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotGame = snapshotGame;
exports.startGame = startGame;
exports.handleGameMessage = handleGameMessage;
exports.tickGame = tickGame;
exports.endGame = endGame;
exports.removeFromGame = removeFromGame;
exports.invitePositions = invitePositions;
exports.huntSpawnIds = huntSpawnIds;
exports.huntItemFor = huntItemFor;
const crypto_1 = require("crypto");
const protocol_1 = require("./protocol");
const content_1 = require("./content");
function participants(room) {
    return room.game ? [...room.game.participants] : [];
}
function scoreboard(room) {
    if (!room.game)
        return [];
    return participants(room)
        .map((id) => {
        const player = room.players.get(id);
        return {
            id,
            name: player?.name || 'Spieler',
            score: room.game?.scores.get(id) || 0,
            role: room.game?.roles.get(id) || 'spieler',
            title: player?.title || ''
        };
    })
        .sort((first, second) => second.score - first.score || first.name.localeCompare(second.name));
}
function safeQuestion(question) {
    return {
        id: question.id,
        prompt: question.prompt,
        options: [...question.options]
    };
}
function snapshotGame(room) {
    const game = room.game;
    if (!game)
        return null;
    const roles = {};
    for (const [id, role] of game.roles.entries())
        roles[id] = role;
    const snapshot = {
        game: game.mode,
        phase: game.phase,
        roundId: game.roundId,
        hostId: game.hostId,
        startedAt: game.startedAt,
        endsAt: game.endsAt,
        phaseEndsAt: game.phaseEndsAt,
        participants: participants(room),
        roles,
        scoreboard: scoreboard(room)
    };
    if (game.mode === 'hunt') {
        const spawns = Array.isArray(game.data.spawns) ? game.data.spawns : [];
        snapshot.hunt = {
            remaining: spawns.filter((spawn) => !spawn.claimedBy).length,
            total: spawns.length,
            spawns: spawns.map((spawn) => ({
                id: spawn.id,
                x: spawn.x,
                z: spawn.z,
                de: spawn.de,
                article: spawn.article,
                example: spawn.example,
                claimedBy: spawn.claimedBy
            }))
        };
    }
    else if (game.mode === 'tag' || game.mode === 'hide') {
        snapshot.tag = {
            mode: game.mode,
            itId: game.data.itId,
            seekerId: game.data.seekerId,
            foundIds: [...(game.data.foundIds || [])],
            hidingUntil: game.data.hidingUntil
        };
    }
    else if (game.mode === 'quiz') {
        const question = game.data.questions?.[game.data.questionIndex];
        snapshot.quiz = {
            questionIndex: game.data.questionIndex || 0,
            totalQuestions: game.data.questions?.length || 0,
            answeredCount: game.data.answers instanceof Map ? game.data.answers.size : 0,
            question: question ? safeQuestion(question) : undefined
        };
    }
    return snapshot;
}
function broadcastState(room, ctx) {
    ctx.broadcast({ type: 'game:state', state: snapshotGame(room) });
}
function ringPositions(ids, centerX, centerZ, radius) {
    const positions = {};
    ids.forEach((id, index) => {
        const angle = (index / Math.max(1, ids.length)) * Math.PI * 2;
        positions[id] = {
            x: Number((centerX + Math.cos(angle) * radius).toFixed(2)),
            z: Number((centerZ + Math.sin(angle) * radius).toFixed(2))
        };
    });
    return positions;
}
function beginQuestion(room, ctx, index, now) {
    const game = room.game;
    if (!game || game.mode !== 'quiz')
        return;
    const question = game.data.questions[index];
    if (!question) {
        endGame(room, ctx, 'quiz-done');
        return;
    }
    game.phase = 'question';
    game.data.questionIndex = index;
    game.data.answers = new Map();
    game.phaseEndsAt = now + content_1.QUIZ_CONFIG.questionMs;
    broadcastState(room, ctx);
}
function finalizeQuestion(room, ctx, now) {
    const game = room.game;
    if (!game || game.mode !== 'quiz' || !(game.data.answers instanceof Map))
        return;
    const question = game.data.questions[game.data.questionIndex];
    if (!question)
        return;
    const correctAnswers = [...game.data.answers.entries()]
        .filter(([, answer]) => answer.optionIndex === question.correctIndex)
        .sort((first, second) => first[1].at - second[1].at)
        .slice(0, content_1.QUIZ_CONFIG.points.length);
    correctAnswers.forEach(([id], index) => {
        const points = content_1.QUIZ_CONFIG.points[index] || 0;
        const score = (game.scores.get(id) || 0) + points;
        game.scores.set(id, score);
        ctx.setScore(id, score);
    });
    game.phase = 'reveal';
    game.phaseEndsAt = now + content_1.QUIZ_CONFIG.revealMs;
    ctx.broadcast({
        type: 'quiz:result',
        questionIndex: game.data.questionIndex,
        correctIndex: question.correctIndex,
        correctAnswer: question.options[question.correctIndex],
        winners: correctAnswers.map(([id], index) => ({ id, points: content_1.QUIZ_CONFIG.points[index] || 0 })),
        scores: scoreboard(room)
    });
    broadcastState(room, ctx);
}
function startGame(room, ctx, hostId, mode) {
    if (!protocol_1.GAME_MODES.has(mode))
        return { ok: false, error: 'Unbekanntes Spiel.' };
    if (room.game)
        return { ok: false, error: 'In diesem Raum läuft bereits ein Spiel.' };
    if (room.hostId !== hostId)
        return { ok: false, error: 'Nur der Gastgeber kann ein Spiel starten.' };
    if ((mode === 'hunt' || mode === 'tag' || mode === 'hide') && room.level !== '1') {
        return { ok: false, error: 'Dieses Spiel kann nur in der Stadt gestartet werden.' };
    }
    if ((mode === 'tag' || mode === 'hide') && room.players.size < content_1.TAG_CONFIG.minPlayers) {
        return { ok: false, error: 'Für dieses Spiel brauchst du mindestens zwei Spieler.' };
    }
    if (room.players.size < 1)
        return { ok: false, error: 'Es sind keine Spieler im Raum.' };
    const now = Date.now();
    const gameMode = mode;
    const chosen = [...room.players.values()]
        .sort((first, second) => first.joinedAt - second.joinedAt)
        .slice(0, protocol_1.MAX_GAME_PLAYERS);
    const game = {
        mode: gameMode,
        phase: gameMode === 'hunt' ? 'playing' : gameMode === 'quiz' ? 'question' : 'countdown',
        roundId: (0, crypto_1.randomUUID)(),
        hostId,
        startedAt: now,
        phaseEndsAt: 0,
        endsAt: 0,
        participants: new Set(chosen.map((player) => player.id)),
        roles: new Map(),
        scores: new Map(),
        data: {}
    };
    chosen.forEach((player) => {
        game.roles.set(player.id, gameMode === 'tag' ? 'runner' : gameMode === 'hide' ? 'hider' : 'spieler');
        game.scores.set(player.id, 0);
        ctx.setScore(player.id, 0);
        ctx.setRole(player.id, game.roles.get(player.id) || 'spieler');
    });
    for (const player of room.players.values()) {
        if (!game.participants.has(player.id))
            ctx.setRole(player.id, 'spectator');
    }
    room.game = game;
    if (gameMode === 'hunt') {
        game.endsAt = now + content_1.HUNT_CONFIG.durationMs;
        game.data.spawns = (0, content_1.buildHuntSpawns)().slice(0, content_1.HUNT_CONFIG.maxItems).map((spawn) => ({
            ...spawn,
            claimedBy: undefined
        }));
        ctx.teleportAll(ringPositions([...game.participants], 30, 95, 6));
    }
    else if (gameMode === 'tag') {
        const ids = [...game.participants];
        const itId = ids[Math.floor(Math.random() * ids.length)];
        game.data.itId = itId;
        game.data.immunityUntil = 0;
        game.roles.set(itId, 'it');
        ctx.setRole(itId, 'it');
        game.phaseEndsAt = now + content_1.TAG_CONFIG.countdownMs;
        game.endsAt = now + content_1.TAG_CONFIG.countdownMs + content_1.TAG_CONFIG.roundMs;
        const positions = ringPositions(ids, 30, 95, content_1.TAG_CONFIG.spawnRadius);
        positions[itId] = { x: 30, z: 95 };
        ctx.teleportAll(positions);
    }
    else if (gameMode === 'hide') {
        const ids = [...game.participants];
        const seekerId = ids[Math.floor(Math.random() * ids.length)];
        game.data.seekerId = seekerId;
        game.data.foundIds = [];
        game.roles.set(seekerId, 'seeker');
        ctx.setRole(seekerId, 'seeker');
        game.phaseEndsAt = now + content_1.TAG_CONFIG.countdownMs;
        game.data.hidingUntil = now + content_1.TAG_CONFIG.countdownMs + content_1.TAG_CONFIG.hidePhaseMs;
        game.endsAt = game.data.hidingUntil + content_1.TAG_CONFIG.roundMs;
        const positions = ringPositions(ids, 30, 95, content_1.TAG_CONFIG.spawnRadius + 4);
        positions[seekerId] = { x: 30, z: 95 };
        ctx.teleportAll(positions);
    }
    else {
        const shuffled = [...content_1.QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, content_1.QUIZ_CONFIG.questionsPerRound);
        game.data.questions = shuffled;
        game.data.questionIndex = 0;
        game.data.answers = new Map();
        game.data.total = shuffled.length;
        game.endsAt = now + content_1.QUIZ_CONFIG.questionsPerRound * (content_1.QUIZ_CONFIG.questionMs + content_1.QUIZ_CONFIG.revealMs);
        beginQuestion(room, ctx, 0, now);
    }
    ctx.broadcast({ type: 'game:started', game: gameMode });
    broadcastState(room, ctx);
    return { ok: true };
}
function handleGameMessage(room, ctx, playerId, message) {
    const game = room.game;
    if (!game || game.phase === 'ended')
        return;
    const player = room.players.get(playerId);
    if (!player || !game.participants.has(playerId))
        return;
    const now = Date.now();
    if (message.type === 'hunt:collect') {
        if (game.mode !== 'hunt' || game.phase !== 'playing')
            return;
        if (now - player.lastGameActionAt < 200)
            return;
        player.lastGameActionAt = now;
        const spawnId = typeof message.spawnId === 'string' ? message.spawnId : '';
        const spawn = (game.data.spawns || []).find((entry) => entry.id === spawnId);
        if (!spawn || spawn.claimedBy)
            return;
        if (Math.hypot(player.x - spawn.x, player.z - spawn.z) > content_1.HUNT_CONFIG.collectDistance) {
            ctx.sendTo(playerId, { type: 'game:error', message: 'Du bist zu weit weg. Geh näher heran.' });
            return;
        }
        spawn.claimedBy = playerId;
        const score = (game.scores.get(playerId) || 0) + content_1.HUNT_CONFIG.pointsPerItem;
        game.scores.set(playerId, score);
        ctx.setScore(playerId, score);
        ctx.broadcast({
            type: 'game:event',
            event: 'hunt:collect',
            playerId,
            playerName: player.name,
            spawnId,
            de: spawn.de,
            example: spawn.example
        });
        broadcastState(room, ctx);
        if ((game.data.spawns || []).every((entry) => entry.claimedBy)) {
            endGame(room, ctx, 'all-found');
        }
        return;
    }
    if (message.type === 'tag:attempt') {
        if (game.mode !== 'tag' && game.mode !== 'hide')
            return;
        if (game.phase !== 'playing')
            return;
        if (now - player.lastGameActionAt < content_1.TAG_CONFIG.actionCooldownMs)
            return;
        player.lastGameActionAt = now;
        const targetId = typeof message.targetId === 'string' ? message.targetId : '';
        const target = room.players.get(targetId);
        if (!target || targetId === playerId || !game.participants.has(targetId))
            return;
        if (Math.hypot(player.x - target.x, player.z - target.z) > content_1.TAG_CONFIG.tagDistance)
            return;
        if (game.mode === 'tag') {
            if (game.data.itId !== playerId)
                return;
            if (game.roles.get(targetId) !== 'runner')
                return;
            if (now < (game.data.immunityUntil || 0))
                return;
            game.roles.set(playerId, 'runner');
            ctx.setRole(playerId, 'runner');
            game.roles.set(targetId, 'it');
            ctx.setRole(targetId, 'it');
            game.data.itId = targetId;
            game.data.immunityUntil = now + content_1.TAG_CONFIG.immunityMs;
            const score = (game.scores.get(playerId) || 0) + 1;
            game.scores.set(playerId, score);
            ctx.setScore(playerId, score);
            ctx.broadcast({
                type: 'game:event',
                event: 'tag:tagged',
                playerId,
                playerName: player.name,
                targetId,
                targetName: target.name
            });
            broadcastState(room, ctx);
            return;
        }
        if (game.data.seekerId !== playerId)
            return;
        if (game.roles.get(targetId) !== 'hider')
            return;
        game.roles.set(targetId, 'found');
        ctx.setRole(targetId, 'found');
        if (!game.data.foundIds.includes(targetId))
            game.data.foundIds.push(targetId);
        const score = (game.scores.get(playerId) || 0) + 1;
        game.scores.set(playerId, score);
        ctx.setScore(playerId, score);
        ctx.broadcast({
            type: 'game:event',
            event: 'hide:found',
            playerId,
            playerName: player.name,
            targetId,
            targetName: target.name
        });
        const hiders = [...game.participants].filter((id) => game.roles.get(id) === 'hider');
        broadcastState(room, ctx);
        if (hiders.length === 0)
            endGame(room, ctx, 'all-found');
        return;
    }
    if (message.type === 'quiz:answer') {
        if (game.mode !== 'quiz' || game.phase !== 'question')
            return;
        if (!(game.data.answers instanceof Map))
            return;
        if (game.data.answers.has(playerId))
            return;
        const question = game.data.questions[game.data.questionIndex];
        if (!question)
            return;
        const optionIndex = typeof message.optionIndex === 'number' ? message.optionIndex : -1;
        if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length)
            return;
        game.data.answers.set(playerId, { optionIndex, at: now });
        ctx.sendTo(playerId, { type: 'quiz:ack', questionIndex: game.data.questionIndex });
        broadcastState(room, ctx);
        if (game.data.answers.size >= game.participants.size) {
            finalizeQuestion(room, ctx, now);
        }
    }
}
function tickGame(room, ctx, now) {
    const game = room.game;
    if (!game)
        return;
    if (game.phase === 'ended') {
        if (now >= game.endsAt) {
            room.game = null;
            for (const player of room.players.values()) {
                ctx.setRole(player.id, 'spieler');
                ctx.setScore(player.id, 0);
            }
            ctx.broadcast({ type: 'game:state', state: null });
        }
        return;
    }
    if (game.mode === 'hunt') {
        if (now >= game.endsAt)
            endGame(room, ctx, 'time');
        return;
    }
    if (game.mode === 'tag') {
        if (game.phase === 'countdown' && now >= game.phaseEndsAt) {
            game.phase = 'playing';
            game.phaseEndsAt = 0;
            broadcastState(room, ctx);
        }
        if (now >= game.endsAt)
            endGame(room, ctx, 'time');
        return;
    }
    if (game.mode === 'hide') {
        if (game.phase === 'countdown' && now >= game.phaseEndsAt) {
            game.phase = 'hiding';
            game.phaseEndsAt = game.data.hidingUntil;
            broadcastState(room, ctx);
        }
        else if (game.phase === 'hiding' && now >= game.data.hidingUntil) {
            game.phase = 'playing';
            game.phaseEndsAt = 0;
            broadcastState(room, ctx);
        }
        if (now >= game.endsAt)
            endGame(room, ctx, 'time');
        return;
    }
    if (game.mode === 'quiz') {
        if (game.phase === 'question' && now >= game.phaseEndsAt) {
            finalizeQuestion(room, ctx, now);
            return;
        }
        if (game.phase === 'reveal' && now >= game.phaseEndsAt) {
            const next = (game.data.questionIndex || 0) + 1;
            if (next >= (game.data.total || 0)) {
                endGame(room, ctx, 'quiz-done');
            }
            else {
                beginQuestion(room, ctx, next, now);
            }
        }
    }
}
function endGame(room, ctx, reason) {
    const game = room.game;
    if (!game || game.phase === 'ended')
        return;
    const now = Date.now();
    const board = scoreboard(room);
    const maxScore = Math.max(0, ...board.map((entry) => entry.score));
    let winnerIds = board.filter((entry) => entry.score === maxScore && maxScore > 0).map((entry) => entry.id);
    if (game.mode === 'hide') {
        if (reason === 'all-found') {
            winnerIds = game.data.seekerId ? [game.data.seekerId] : [];
        }
        else {
            winnerIds = [...game.participants].filter((id) => game.roles.get(id) === 'hider');
        }
    }
    game.phase = 'ended';
    game.phaseEndsAt = now + 8000;
    game.endsAt = now + 8000;
    game.data.reason = reason;
    game.data.winnerIds = winnerIds;
    ctx.recordScores(game.mode, board.map((entry) => {
        const player = room.players.get(entry.id);
        return {
            playerKey: player?.playerKey || entry.id,
            name: entry.name,
            score: entry.score
        };
    }));
    ctx.broadcast({
        type: 'game:ended',
        game: game.mode,
        reason,
        winnerIds,
        scores: board
    });
    broadcastState(room, ctx);
    ctx.teleportAll(ringPositions([...game.participants], 30, 95, 7));
}
function removeFromGame(room, ctx, playerId) {
    const game = room.game;
    if (!game || game.phase === 'ended')
        return;
    if (!game.participants.delete(playerId))
        return;
    game.roles.delete(playerId);
    game.scores.delete(playerId);
    ctx.setRole(playerId, 'spieler');
    const minPlayers = game.mode === 'tag' || game.mode === 'hide' ? content_1.TAG_CONFIG.minPlayers : 1;
    if (game.participants.size < minPlayers) {
        endGame(room, ctx, 'too-few-players');
        return;
    }
    if (game.mode === 'tag' && game.data.itId === playerId) {
        const nextId = [...game.participants][0];
        game.data.itId = nextId;
        game.roles.set(nextId, 'it');
        ctx.setRole(nextId, 'it');
        game.data.immunityUntil = Date.now() + content_1.TAG_CONFIG.immunityMs;
    }
    if (game.mode === 'hide' && game.data.seekerId === playerId) {
        const nextId = [...game.participants].find((id) => game.roles.get(id) === 'hider');
        if (!nextId) {
            endGame(room, ctx, 'too-few-players');
            return;
        }
        game.data.seekerId = nextId;
        game.roles.set(nextId, 'seeker');
        ctx.setRole(nextId, 'seeker');
    }
    if (game.mode === 'hide' && ![...game.participants].some((id) => game.roles.get(id) === 'hider')) {
        endGame(room, ctx, 'all-found');
        return;
    }
    broadcastState(room, ctx);
}
function invitePositions(room) {
    return ringPositions([...room.players.keys()], 30, 95, 6);
}
function huntSpawnIds() {
    return content_1.HUNT_SPAWNS.map((spawn) => spawn.id);
}
function huntItemFor(spawnId) {
    const spawn = content_1.HUNT_SPAWNS.find((entry) => entry.id === spawnId);
    return spawn ? content_1.HUNT_ITEMS[spawn.key] : undefined;
}
