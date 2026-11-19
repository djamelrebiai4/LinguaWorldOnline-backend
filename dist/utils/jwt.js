"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.supabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
exports.supabaseClient = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseSecretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
const verifyJwt = (token) => {
    return exports.supabaseClient.auth.getUser(token).then(({ data, error }) => {
        if (error || !data?.user) {
            throw new Error('Invalid token');
        }
        return {
            sub: data.user.id,
            email: data.user.email,
        };
    });
};
exports.verifyJwt = verifyJwt;
