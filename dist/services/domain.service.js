"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDomainAuthorizedInDB = isDomainAuthorizedInDB;
exports.getDomainRecord = getDomainRecord;
exports.deactivateDomain = deactivateDomain;
exports.activateDomain = activateDomain;
exports.listAuthorizedDomains = listAuthorizedDomains;
const supabase_1 = require("../config/supabase");
/**
 * Check if a domain is authorized in the database (kill-switch).
 * Returns the domain record if found and active.
 */
async function isDomainAuthorizedInDB(domain) {
    const { data, error } = await supabase_1.supabaseAdmin
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
async function getDomainRecord(domain) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('authorized_domains')
        .select('*')
        .eq('domain', domain)
        .single();
    if (error || !data) {
        return null;
    }
    return data;
}
/**
 * Deactivate a domain (kill switch).
 */
async function deactivateDomain(domain, reason) {
    const { error } = await supabase_1.supabaseAdmin
        .from('authorized_domains')
        .update({ is_active: false, blocked_reason: reason })
        .eq('domain', domain);
    return !error;
}
/**
 * Activate a domain.
 */
async function activateDomain(domain) {
    const { error } = await supabase_1.supabaseAdmin
        .from('authorized_domains')
        .update({ is_active: true, blocked_reason: null })
        .eq('domain', domain);
    return !error;
}
/**
 * List all authorized domains.
 */
async function listAuthorizedDomains() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('authorized_domains')
        .select('*')
        .order('created_at', { ascending: false });
    if (error || !data) {
        return [];
    }
    return data;
}
