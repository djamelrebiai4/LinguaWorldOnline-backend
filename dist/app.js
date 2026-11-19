"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("./config/cors");
const domain_guard_1 = require("./middleware/domain-guard");
const rateLimit_1 = require("./middleware/rateLimit");
const error_1 = require("./middleware/error");
const notFound_1 = require("./middleware/notFound");
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const content_1 = __importDefault(require("./routes/content"));
const user_1 = __importDefault(require("./routes/user"));
const chat_1 = __importDefault(require("./routes/chat"));
const admin_1 = __importDefault(require("./routes/admin"));
function createApp() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)(cors_2.corsOptions));
    // Body parsing
    app.use(express_1.default.json({ limit: '32kb' }));
    app.use(express_1.default.urlencoded({ extended: false, limit: '32kb' }));
    // Global rate limiting
    app.use(rateLimit_1.generalRateLimit);
    // Health is public — no domain restriction
    app.use('/api/v1/health', health_1.default);
    // Domain guard for all other API routes
    app.use('/api/v1/*', domain_guard_1.domainGuard);
    // API routes (versioned)
    app.use('/api/v1/auth', auth_1.default);
    app.use('/api/v1/content', content_1.default);
    app.use('/api/v1/user', user_1.default);
    app.use('/api/v1/chat', chat_1.default);
    app.use('/api/v1/admin', admin_1.default);
    // 404
    app.use(notFound_1.notFound);
    // Centralized error handler
    app.use(error_1.errorHandler);
    return app;
}
