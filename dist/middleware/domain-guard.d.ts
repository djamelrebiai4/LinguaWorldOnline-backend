import { Request, Response, NextFunction } from 'express';
/**
 * Domain Guard Middleware
 * Restricts API access to authorized domains only.
 * Checks both environment variables (fast) and database (kill-switch).
 * CORS headers can be forged by non-browser clients, so this is combined
 * with JWT authentication for protected routes.
 */
export declare const domainGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getClientDomain: (req: Request) => string | null;
//# sourceMappingURL=domain-guard.d.ts.map