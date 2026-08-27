# RTB Exam Preparation Platform — Phase 0 Project Foundation

An independent, high-performance RBT Exam Preparation Platform built on **Astro.js** and **Cloudflare Workers / D1 / R2 / KV / Queues**.

---

## 1. Architectural Principles

- **100% Free & Open Access (Phase 1)**: Zero student signup, zero login wall, and zero mandatory registration.
- **Local-First Privacy**: Progress stored client-side in browser `IndexedDB (RTB_StudyDB)` with 1-Click JSON backup & restore.
- **Edge Native**: Runs natively on Cloudflare Workers edge runtime with Web Crypto JWT tokens for protected Admin endpoints.
- **Zero Dummy Data**: Built to ingest authentic BACB Task List 2nd Edition Question Bank CSV files.

---

## 2. Directory Structure

```
├── migrations/                # D1 Relational SQL Migrations (0001_initial_schema.sql)
├── src/
│   ├── components/            # Astro & React interactive client islands
│   ├── data/                  # Task List 2nd Edition taxonomy & authentic mock questions
│   ├── env.d.ts               # Astro & Cloudflare environment types
│   ├── layouts/               # Shell layouts (Layout.astro)
│   ├── lib/
│   │   ├── ai/                # Multi-provider AI Gateway (DeepSeek, OpenAI, etc.)
│   │   ├── api/               # API response envelopes & validation
│   │   ├── auth/              # Web Crypto JWT admin signer & verifier
│   │   ├── config/            # Typed public vs server-only configuration
│   │   ├── csv/               # RFC 4180 streaming CSV parser & hasher
│   │   ├── db/                # Cloudflare D1 client abstraction
│   │   ├── errors/            # Centralized AppError hierarchy
│   │   ├── logger/            # Structured server logger with privacy redaction
│   │   ├── rate-limit/        # Anonymous IP sliding-window limiter
│   │   ├── services/          # Cloudflare R2 storage service abstraction
│   │   ├── srs/               # SuperMemo-2 Spaced Repetition algorithm
│   │   └── storage/           # Client-side IndexedDB repository (RTB_StudyDB)
│   ├── middleware/            # Astro middleware for security headers & admin boundaries
│   ├── pages/
│   │   ├── api/v1/            # Standardized REST API endpoints
│   │   ├── admin/             # Authenticated Admin Studio portal
│   │   ├── 404.astro          # Custom 404 handler
│   │   ├── 500.astro          # Custom 500 handler
│   │   └── *.astro            # Public student learning pages
│   ├── styles/                # Global Tailwind CSS and custom design tokens
│   ├── tests/                 # Unit & integration test suite (run-all.ts)
│   └── types/                 # Unified TypeScript data models
├── astro.config.mjs           # Astro configuration with Cloudflare adapter
├── tailwind.config.js         # Design system configuration
├── tsconfig.json              # TypeScript strict configuration
├── wrangler.toml              # Cloudflare Workers bindings (D1, R2, KV, Queues)
└── package.json
```

---

## 3. Local Development & Testing

### Prerequisites
- Node.js $\ge 18.20.0$
- npm $\ge 9.0.0$

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript strict validation
npm run check

# 3. Run Phase 0 Foundation Test Suite
npm test

# 4. Run local development edge server
npm run dev

# 5. Build for Cloudflare production
npm run build
```

---

## 4. Cloudflare Bindings in `wrangler.toml`

| Binding Name | Type | Purpose |
| :--- | :--- | :--- |
| `DB` | Cloudflare D1 | Primary relational database (`rtb_exam_db`) |
| `STORAGE_BUCKET` | Cloudflare R2 | Asset & CSV storage (`rtb-exam-assets`) |
| `EDGE_KV` | Cloudflare KV | Edge cache & IP token buckets |
| `JOBS_QUEUE` | Cloudflare Queues | Async batch CSV & AI jobs |

---

## 5. Security & Privacy Model

- **Public Safety**: All public endpoints reject PII collection.
- **Admin JWT**: Signed with Edge Web Crypto HMAC-SHA256 in HttpOnly, Secure, SameSite=Lax cookies.
- **Security Headers**: HSTS, CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.
