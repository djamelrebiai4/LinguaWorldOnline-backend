import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { isDomainAuthorizedInDB } from '../services/domain.service';

/**
 * Domain Guard Middleware
 * Restricts API access to authorized domains only.
 * Checks both environment variables (fast) and database (kill-switch).
 * CORS headers can be forged by non-browser clients, so this is combined
 * with JWT authentication for protected routes.
 */
export const domainGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Determine the client domain from Origin or Referer
  let clientDomain: string | null = null;

  if (origin) {
    try {
      clientDomain = new URL(origin).origin;
    } catch {
      clientDomain = null;
    }
  } else if (referer) {
    try {
      clientDomain = new URL(referer).origin;
    } catch {
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
  const authorizedDomains = env.authorizedDomains;
  if (!authorizedDomains.includes(clientDomain)) {
    res.status(403).json({
      error: 'Domain not authorized',
      domain: clientDomain,
      message: 'This domain is not permitted to access the API.'
    });
    return;
  }

  // 2. Check database kill-switch (authoritative)
  const dbAuthorized = await isDomainAuthorizedInDB(clientDomain);
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

export const getClientDomain = (req: Request): string | null => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      return null;
    }
  }
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
  return null;
};
