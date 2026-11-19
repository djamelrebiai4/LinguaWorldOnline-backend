"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
// AI chat endpoint (replaces api/german-chat.js, JWT required)
router.post('/chat', auth_1.authMiddleware, rateLimit_1.strictRateLimit, (0, validation_1.validate)(schemas_1.chatSchema), async (req, res) => {
    const { npcKey, language, messages, gameLocation } = req.body;
    // Forward to Groq AI service (business logic stays here)
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        return res.status(503).json({ error: 'AI chat is not configured on the server.' });
    }
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: `You are a German-learning NPC (${npcKey}). Respond in German with ${language} translation.` },
                    ...messages,
                ],
                max_completion_tokens: 250,
                temperature: 0.7,
            }),
        });
        if (!response.ok) {
            return res.status(502).json({ error: 'AI service unavailable' });
        }
        const data = (await response.json());
        res.json({ reply: data.choices?.[0]?.message?.content || '' });
    }
    catch {
        res.status(502).json({ error: 'Could not connect to AI service' });
    }
});
exports.default = router;
