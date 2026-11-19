export interface DomainRecord {
    id: string;
    domain: string;
    is_active: boolean;
    blocked_reason: string | null;
}
/**
 * Check if a domain is authorized in the database (kill-switch).
 * Returns the domain record if found and active.
 */
export declare function isDomainAuthorizedInDB(domain: string): Promise<boolean>;
/**
 * Get domain record details (for logging/audit).
 */
export declare function getDomainRecord(domain: string): Promise<DomainRecord | null>;
/**
 * Deactivate a domain (kill switch).
 */
export declare function deactivateDomain(domain: string, reason: string): Promise<boolean>;
/**
 * Activate a domain.
 */
export declare function activateDomain(domain: string): Promise<boolean>;
/**
 * List all authorized domains.
 */
export declare function listAuthorizedDomains(): Promise<DomainRecord[]>;
//# sourceMappingURL=domain.service.d.ts.map