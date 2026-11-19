import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validation';
import { chatSchema } from '../validators/schemas';

const router = Router();

// AI chat endpoint (replaces api/german-chat.js, JWT required)
router.post('/chat', authMiddleware, strictRateLimit, validate(chatSchema), async (req, res) => {
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

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    res.json({ reply: data.choices?.[0]?.message?.content || '' });
  } catch {
    res.status(502).json({ error: 'Could not connect to AI service' });
  }
});

export default router;
