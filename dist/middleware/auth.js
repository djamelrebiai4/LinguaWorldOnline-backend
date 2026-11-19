"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const payload = await (0, jwt_1.verifyJwt)(token);
        req.userId = payload.sub;
        req.userEmail = payload.email;
        next();
    }
    catch {
        res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.substring(7);
    try {
        const payload = await (0, jwt_1.verifyJwt)(token);
        req.userId = payload.sub;
        req.userEmail = payload.email;
    }
    catch {
        // ignore, continue as unauthenticated
    }
    next();
};
exports.optionalAuth = optionalAuth;
