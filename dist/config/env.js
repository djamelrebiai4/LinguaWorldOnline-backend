"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_ORIGIN',
    'AUTHORIZED_DOMAINS',
    'SUPABASE_URL',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_JWT_SECRET',
    'GROQ_API_KEY',
];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
exports.env = {
    port: parseInt(process.env.PORT, 10),
    nodeEnv: process.env.NODE_ENV,
    frontendOrigin: process.env.FRONTEND_ORIGIN,
    authorizedDomains: process.env.AUTHORIZED_DOMAINS
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
};
