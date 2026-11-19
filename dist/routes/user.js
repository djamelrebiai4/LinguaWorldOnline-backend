"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
// Get user progress (authenticated)
router.get('/progress', auth_1.authMiddleware, rateLimit_1.strictRateLimit, async (req, res) => {
    const authenticatedReq = req;
    const userId = authenticatedReq.userId;
    const { data, error } = await supabase_1.supabaseAdmin
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) {
        // Return empty progress if not found yet
        return res.json({ userId, xp: 0, level: 1, completedQuests: [] });
    }
    res.json(data);
});
exports.default = router;
