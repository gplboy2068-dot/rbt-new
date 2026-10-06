# RBT Practice Exam — Fixes Applied (1-by-1)

## Fix 1: Hardcoded admin password & JWT secret removed
- Pehle admin password 3 login files me code ke andar plaintext tha, aur git history (commit "security(admin): update administrator password...") ki wajah se repo public hote hi wo password sabko dikhne layak ho gaya tha.
- Ab password / username / JWT secret code me NAHI hai. Ye sirf server environment se aayenge:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_JWT_SECRET`
- Agar ye configured nahi hain, admin login fail-closed hoga (500 SERVER_NOT_CONFIGURED) — galat password se login nahi hoga.

### DEPLOY SE PEHLE ZAROOR KARO (warna admin login kaam nahi karega)
```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_JWT_SECRET
```
- ADMIN_PASSWORD ke liye **bilkul naya password** choose karo. Purana password ab purani git history me public ho chuka hai, use dobara mat use karna.
- ADMIN_JWT_SECRET ke liye lambi random string use karo (kam se kam 32 characters).
- Naya password/secret set karne ke baad purana password bekaar ho jayega, isliye history me dikhne wala purana password koi risk nahi rahega. (Agar history ko poori tarah saaf karna hai to `git filter-repo` se scrub karke force-push karna hoga — ye optional hai aur saare clones ko todta hai, isliye pehle rotation hi kaafi hai.)

## Fix 2: Unknown page par Cloudflare Error 1101 crash — FIXED & VERIFIED
- Root cause: Astro Cloudflare adapter unknown routes par `env.ASSETS.fetch()` call karta hai, lekin `wrangler.toml` me `assets` ka `binding = "ASSETS"` missing tha, isliye worker crash hota tha.
- Fix: `assets = { directory = "./dist", binding = "ASSETS" }`
- Local wrangler test me ab unknown URL proper **404 page** deta hai (pehle 500/crash).

## Fix 3: wrangler.toml
- `ENVIRONMENT = "development"` -> `"production"`
- `account_id` hata diya (wrangler login se khud resolve karta hai, public repo me rakhne ki zarurat nahi)
- D1/KV IDs rakhe hain kyunki ye sirf resource identifiers hain, secrets nahi — inhe hatane se deploy toot jata. Secrets is file me kabhi mat likhna.

## Fix 4: Build output repo se hataya
- `.next/` aur `tsconfig.tsbuildinfo` delete kar diye (tarball me the).
- `.gitignore` me `.next/`, `next-env.d.ts`, `*.tsbuildinfo` add kar diye taaki dobara commit na hon.

## Fix 5: Next.js leftovers hataye
- Ye project Astro par chalta hai. `src/app/` (pure Next.js pages), `next.config.mjs`, `next-env.d.ts`, `src/components/layout/Navbar.tsx`, `Footer.tsx` aur `next` dependency delete kar di.
- Inme ek duplicate admin login bhi tha jisme hardcoded password tha — wo bhi gaya.
- Astro build aur poora test suite iske baad bhi pass hai.

## Fix 6: RTB -> RBT branding
- `package.json`: name `rbt-practice-exam`, proper description, keywords, galat `main: index.js` hataya, `type: module` kiya (isiliye `postcss.config.js`/`tailwind.config.js` ko `.cjs` rename kiya).
- README title/description RBT kiya.
- NOTE: `rtb_admin_token`, `RTB_StudyDB`, `rtb_theme`, `rtb_attempts` jaise internal storage/cookie naam JAN-BOOJH kar nahi badle — inhe badalne se users ka saved progress/session toot jata. Ye user ko dikhai nahi dete.

## Fix 7: Question count ek kiya
- Pehle homepage `85+`, footer `60Q+`, practice UI `80/120` — sab alag the.
- Ab homepage, footer aur topic page ka count code se aata hai: `{INITIAL_QUESTIONS.length}+` = **80+** har jagah. Jaise hi question bank badhega, count khud update ho jayega.
- Practice UI jo total dikhata hai wo live API ka real total hai (abhi seed data me 80).

## Fix 8: AI Tutor "analysing" par atakta tha
- Root cause: DeepSeek API call par koi timeout nahi tha. API slow/hang ho to UI hamesha ke liye analysing me atak jata tha.
- Server: DeepSeek/OpenAI calls par 15 second timeout add kiya — timeout par gateway apna structured fallback answer de deta hai.
- Browser: AI Tutor aur Practice "Ask AI" dono par 20 second timeout add kiya, timeout par saaf message aata hai, hang nahi hota.

## Verification (local)
- `npm run build` — PASS
- `npm test` — ALL INTEGRATED TESTS PASSED
- `npm run check` (tsc) — 33 errors pehle se hain (un files me jo in fixes me touch nahi hue); fix ki gayi files me 0 errors.
- Wrangler local: Home 200, unknown URL 404, question count 80+, AI Tutor instant reply, admin login bina secret ke fail-closed (500 SERVER_NOT_CONFIGURED).

## GitHub par push kaise karein
```bash
# apne computer par apna repo clone karo (agar pehle se hai to wahi folder use karo)
git clone https://github.com/gplboy2068-dot/rbt-new.git
cd rbt-new
# is zip ke saare files is folder me copy/overwrite karo, aur ye deleted files bhi delete karo:
#   .next/, tsconfig.tsbuildinfo, next.config.mjs, next-env.d.ts, src/app/, src/components/layout/Navbar.tsx, src/components/layout/Footer.tsx
git add -A
git status   # deletions bhi dikhne chahiye
git commit -m "fix: remove hardcoded admin secrets, fix 404 crash, remove Next leftovers, unify question count, AI tutor timeout"
git push
```
