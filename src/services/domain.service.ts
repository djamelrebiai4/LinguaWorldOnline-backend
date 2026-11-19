import { supabaseAdmin } from '../config/supabase';

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
export async function isDomainAuthorizedInDB(domain: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('authorized_domains')
    .select('is_active, blocked_reason')
    .eq('domain', domain)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_active === true;
}

/**
 * Get domain record details (for logging/audit).
 */
export async function getDomainRecord(domain: string): Promise<DomainRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('authorized_domains')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error || !data) {
    return null;
  }

  return data as DomainRecord;
}

/**
 * Deactivate a domain (kill switch).
 */
export async function deactivateDomain(domain: string, reason: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('authorized_domains')
    .update({ is_active: false, blocked_reason: reason })
    .eq('domain', domain);

  return !error;
}

/**
 * Activate a domain.
 */
export async function activateDomain(domain: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('authorized_domains')
    .update({ is_active: true, blocked_reason: null })
    .eq('domain', domain);

  return !error;
}

/**
 * List all authorized domains.
 */
export async function listAuthorizedDomains(): Promise<DomainRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('authorized_domains')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as DomainRecord[];
}
