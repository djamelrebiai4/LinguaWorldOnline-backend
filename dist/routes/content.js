"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimit_1 = require("../middleware/rateLimit");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
// Public content endpoints — no auth required, RLS protects writes
router.get('/vocab', rateLimit_1.generalRateLimit, async (_req, res) => {
    const { data, error } = await supabase_1.supabaseAdmin.from('vocab').select('*');
    if (error)
        return res.status(500).json({ error: 'Failed to fetch vocab' });
    res.json(data);
});
router.get('/quests', rateLimit_1.generalRateLimit, async (_req, res) => {
    const { data, error } = await supabase_1.supabaseAdmin.from('quests').select('*');
    if (error)
        return res.status(500).json({ error: 'Failed to fetch quests' });
    res.json(data);
});
router.get('/quests/:id/tasks', rateLimit_1.generalRateLimit, async (req, res) => {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('quest_tasks')
        .select('*')
        .eq('quest_id', req.params.id);
    if (error)
        return res.status(500).json({ error: 'Failed to fetch quest tasks' });
    res.json(data);
});
router.get('/dialogues/:world', rateLimit_1.generalRateLimit, async (req, res) => {
    const { data: dialogues, error } = await supabase_1.supabaseAdmin
        .from('dialogues')
        .select('*')
        .eq('world', req.params.world);
    if (error)
        return res.status(500).json({ error: 'Failed to fetch dialogues' });
    const dialogue = dialogues?.[0];
    if (!dialogue)
        return res.status(404).json({ error: 'Dialogue not found' });
    const { data: steps, error: stepsError } = await supabase_1.supabaseAdmin
        .from('dialogue_steps')
        .select('*')
        .eq('dialogue_id', dialogue.id)
        .order('step_index', { ascending: true });
    if (stepsError)
        return res.status(500).json({ error: 'Failed to fetch dialogue steps' });
    res.json({ ...dialogue, steps });
});
router.get('/config', rateLimit_1.generalRateLimit, async (_req, res) => {
    const { data, error } = await supabase_1.supabaseAdmin.from('app_config').select('*');
    if (error)
        return res.status(500).json({ error: 'Failed to fetch config' });
    res.json(data);
});
exports.default = router;
