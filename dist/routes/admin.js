"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admin: list users (placeholder for future admin operations)
router.get('/users', auth_1.authMiddleware, async (_req, res) => {
    // In production, check admin role here
    res.json({ message: 'Admin endpoint - user list', users: [] });
});
exports.default = router;
