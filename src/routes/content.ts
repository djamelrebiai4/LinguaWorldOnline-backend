import { Router } from 'express';
import { generalRateLimit } from '../middleware/rateLimit';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Public content endpoints — no auth required, RLS protects writes
router.get('/vocab', generalRateLimit, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('vocab').select('*');
  if (error) return res.status(500).json({ error: 'Failed to fetch vocab' });
  res.json(data);
});

router.get('/quests', generalRateLimit, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('quests').select('*');
  if (error) return res.status(500).json({ error: 'Failed to fetch quests' });
  res.json(data);
});

router.get('/quests/:id/tasks', generalRateLimit, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('quest_tasks')
    .select('*')
    .eq('quest_id', req.params.id);
  if (error) return res.status(500).json({ error: 'Failed to fetch quest tasks' });
  res.json(data);
});

router.get('/dialogues/:world', generalRateLimit, async (req, res) => {
  const { data: dialogues, error } = await supabaseAdmin
    .from('dialogues')
    .select('*')
    .eq('world', req.params.world);
  if (error) return res.status(500).json({ error: 'Failed to fetch dialogues' });

  const dialogue = dialogues?.[0];
  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found' });

  const { data: steps, error: stepsError } = await supabaseAdmin
    .from('dialogue_steps')
    .select('*')
    .eq('dialogue_id', dialogue.id)
    .order('step_index', { ascending: true });
  if (stepsError) return res.status(500).json({ error: 'Failed to fetch dialogue steps' });

  res.json({ ...dialogue, steps });
});

router.get('/config', generalRateLimit, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('app_config').select('*');
  if (error) return res.status(500).json({ error: 'Failed to fetch config' });
  res.json(data);
});

export default router;
