"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientDomain = exports.domainGuard = void 0;
const env_1 = require("../config/env");
const domain_service_1 = require("../services/domain.service");
/**
 * Domain Guard Middleware
 * Restricts API access to authorized domains only.
 * Checks both environment variables (fast) and database (kill-switch).
 * CORS headers can be forged by non-browser clients, so this is combined
 * with JWT authentication for protected routes.
 */
const domainGuard = async (req, res, next) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    // Determine the client domain from Origin or Referer
    let clientDomain = null;
    if (origin) {
        try {
            clientDomain = new URL(origin).origin;
        }
        catch {
            clientDomain = null;
        }
    }
    else if (referer) {
        try {
            clientDomain = new URL(referer).origin;
        }
        catch {
            clientDomain = null;
        }
    }
    // If no origin/referer at all, allow (e.g., curl, health checks, server-to-server)
    // but protected routes will still require JWT
    if (!clientDomain) {
        next();
        return;
    }
    // 1. Check environment variable list (fast path)
    const authorizedDomains = env_1.env.authorizedDomains;
    if (!authorizedDomains.includes(clientDomain)) {
        res.status(403).json({
            error: 'Domain not authorized',
            domain: clientDomain,
            message: 'This domain is not permitted to access the API.'
        });
        return;
    }
    // 2. Check database kill-switch (authoritative)
    const dbAuthorized = await (0, domain_service_1.isDomainAuthorizedInDB)(clientDomain);
    if (!dbAuthorized) {
        res.status(403).json({
            error: 'Domain deactivated',
            domain: clientDomain,
            message: 'This domain has been deactivated by the administrator.'
        });
        return;
    }
    next();
};
exports.domainGuard = domainGuard;
const getClientDomain = (req) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    if (origin) {
        try {
            return new URL(origin).origin;
        }
        catch {
            return null;
        }
    }
    if (referer) {
        try {
            return new URL(referer).origin;
        }
        catch {
            return null;
        }
    }
    return null;
};
exports.getClientDomain = getClientDomain;
