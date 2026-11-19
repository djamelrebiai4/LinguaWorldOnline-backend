# Backend — Lexi Explorer API

Independent Node.js + Express + TypeScript backend deployed on Render.

## Structure

```
backend/
├── src/
│   ├── app.ts           # Express app factory
│   ├── server.ts        # Entry point (listens on PORT, graceful shutdown)
│   ├── config/          # env, supabase, cors config
│   ├── middleware/      # auth, domain-guard, rateLimit, validation, error, notFound
│   ├── routes/          # health, auth, content, user, chat, admin
│   ├── services/        # domain.service (kill-switch)
│   ├── validators/      # Zod schemas
│   ├── utils/           # JWT verification
│   └── types/
├── package.json
├── tsconfig.json
└── .env.example
```

## Endpoints

| Method | Path | Domain Check | Auth | Description |
|--------|------|--------------|------|-------------|
| GET | `/api/v1/health` | No | No | Health check |
| GET | `/api/v1/content/vocab` | Yes | No | Public vocabulary |
| GET | `/api/v1/content/quests` | Yes | No | Public quests |
| GET | `/api/v1/content/quests/:id/tasks` | Yes | No | Quest tasks |
| GET | `/api/v1/content/dialogues/:world` | Yes | No | Dialogue for world |
| GET | `/api/v1/content/config` | Yes | No | App config |
| GET | `/api/v1/auth/me` | Yes | Yes (JWT) | Current user |
| GET | `/api/v1/user/progress` | Yes | Yes (JWT) | User XP/level |
| POST | `/api/v1/user/progress/xp` | Yes | Yes (JWT) | Add XP (server-validated) |
| POST | `/api/v1/user/progress/quest` | Yes | Yes (JWT) | Complete quest task (server-validated) |
| POST | `/api/v1/chat` | Yes | Yes (JWT) | AI chat |
| GET | `/api/v1/admin/users` | Yes | Yes (JWT) | Admin: users |

## Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new **Web Service** pointing to the `backend/` directory
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Set `FRONTEND_ORIGIN` to your Vercel frontend URL

## Security

- **Domain Locking**: `domainGuard` middleware restricts API access to domains listed in `AUTHORIZED_DOMAINS` env var
- **Kill Switch**: `authorized_domains` table in Supabase allows deactivating any domain instantly (`is_active = false`)
- **CORS**: Restricted to `FRONTEND_ORIGIN` only
- **Rate limiting**: 100 req/min general, 20 req/min strict
- **Authentication**: All protected routes require valid Supabase JWT (verified via `supabase.auth.getUser()`)
- **Authorization**: `userId` is extracted from JWT, never trusted from client request body
- **`SUPABASE_SECRET_KEY`** never exposed to frontend
- **RLS** enforced on all Supabase tables

Progress is read-only until game answers and quest completion are verified by server-owned game sessions. The API intentionally does not accept client-submitted XP or task completions.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 3000) |
| `NODE_ENV` | Yes | `production` or `development` |
| `FRONTEND_ORIGIN` | Yes | Production frontend domain for CORS |
| `AUTHORIZED_DOMAINS` | Yes | Comma-separated list of authorized API domains |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service_role key (backend only) |
| `SUPABASE_JWT_SECRET` | Yes | Supabase JWT secret for token verification |
| `GROQ_API_KEY` | Yes | Groq AI API key (backend only) |
| `GROQ_MODEL` | No | Groq model name (default: `openai/gpt-oss-20b`) |
