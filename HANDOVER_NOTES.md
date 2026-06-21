# JobSphere Demo Credibility Pass

Last updated: 2026-06-15

This file is the restart point for the client-demo credibility pass. The checklist below reflects what was completed and what still needs client/demo review.

## Completed Before This Pass

- Resume analyzer rejects empty extraction with `422` and can use the existing `GEMINI_API_KEY` for inline PDF analysis.
- Uploaded resumes no longer receive random fallback scores in the frontend.
- Contact and newsletter forms persist to backend routes.
- Support/contact submit button light-mode contrast was verified.
- Social feed profile views, post impressions, hashtags, trending tags, and public profiles are backend-backed.
- Interview rounds and calendar metadata are persisted instead of rendered as fixed local steps.
- Invalid Tailwind shade names were normalized across `frontend/src`.

## Completed In This Pass

- Admin dashboard billing/revenue credibility:
  - Removed hardcoded MRR, subscriber, tier, and platform-funds claims.
  - Replaced the revenue tab with billing-readiness notes that clearly say a provider must be connected before revenue/payment claims are shown.
- Admin dashboard diagnostics credibility:
  - Replaced fake model accuracy, parser latency, gateway uptime, GPU, and VRAM claims with platform-state diagnostics and AI feature readiness notes.
  - Replaced person-specific mock compliance logs with generic demo safety/configuration notes.
- Feed page credibility:
  - Replaced static industry news with hiring insights derived from jobs, feed posts, and trending tags.
  - Replaced the empty suggested-people panel with profile visibility metrics.
- Recruiter dashboard credibility:
  - Replaced canned skill-chart values with top skills aggregated from the current candidate pool.
- Candidate dashboard credibility:
  - Replaced fake monthly application chart data with current applied/saved/interview counts.
  - Replaced fallback `88%` ATS display with `Not analyzed` until analysis exists.
  - Removed the static `96% Accuracy` recommendation claim.
- Landing page credibility:
  - Removed the fake checkout/payment modal.
  - Pricing CTAs now route to contact as plan setup inquiries.
  - Testimonials are labeled as demo user stories until client-approved references exist.
  - Resume preview uses generic candidate copy and no fake score.
- Auth page credibility:
  - Replaced named candidate/salary/static score proof with generic preview content.
- Email provider readiness:
  - `backend/src/lib/email.ts` keeps Resend as preferred delivery.
  - Added Gmail SMTP fallback via `GMAIL_USER` and `GMAIL_PASS`.
  - Added generic SMTP fallback via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.
- Admin access:
  - `backend/.env` now includes env-backed admin login variables.
  - `backend/src/routes/auth.ts` accepts the configured admin username/password and returns an admin session without touching MongoDB.
  - `backend/src/lib/envAdmin.ts` centralizes the virtual admin profile so `/users/me`, role checks, and admin read routes avoid slow Atlas calls for `env-admin`.
  - `frontend/src/pages/AuthPage.jsx` now exposes an Admin workspace option on login and signup.
- Secret exposure hardening:
  - `.gitignore` now ignores `.env.*`, common key/certificate files, service-account JSON, and credential JSON while allowing `.env.example`.
  - Added placeholder-only `backend/.env.example` and `frontend/.env.example`.
  - Removed hardcoded MongoDB URI fallbacks from `backend/clearDb.mjs` and `backend/deleteMockUsers.mjs`; both now require `MONGODB_URI` from the environment.
  - Removed generated Playwright report artifacts from the workspace.
- Documentation:
  - Updated `AGENT_README.md` with the credibility-pass changes, SMTP/Gmail env support, and verification notes.

## Verification Completed

- `backend`: `npm run typecheck` passed.
- `backend`: `npm run build` passed.
- `backend`: `npm test -- --run` passed.
- `frontend`: `npm run build` passed after final UI changes.
- `frontend`: `npm test -- --run` passed after final UI changes.
- Secret scan: no hardcoded secret-shaped values found outside ignored real `.env` files after the cleanup-script scrub.
- Script syntax: `node --check backend/clearDb.mjs` and `node --check backend/deleteMockUsers.mjs` passed.
- Browser smoke:
  - Landing page showed demo-story and billing-disabled copy, with no fake checkout/card/payment text.
  - Candidate dashboard showed `Application Activity` and `Not analyzed`.
  - Feed showed `Hiring Insights` and `Profile Visibility`.

## Remaining Demo Risks

- Browser smoke for recruiter/admin protected pages was not completed because the already-running local backend on port `3000` began hanging on later login attempts. Production build/tests passed for those pages.
- Browser smoke created temporary users with emails matching `codex-smoke-*@jobsphere.local`. A direct cleanup attempt could not connect to MongoDB from this shell because Atlas rejected the connection; remove those users if they appear in the shared database.
- `frontend/src/data/mockData.js` still contains static seed/demo content for jobs, opportunities, testimonials, FAQs, skill catalogs, roadmaps, and certifications.
- Other public surfaces not fully audited in this pass may still contain marketing language that should be client-approved before launch, especially `AboutPage`, `OpportunitiesPage`, `CommandPalette`, footer copy, and backend AI prompt copy.
- Real payment checkout is intentionally not connected.
- Real outbound email requires either Resend variables or Gmail/SMTP variables in the deployment environment.
- Real calendar automation still requires `CALENDAR_SYNC_WEBHOOK_URL`.

## External Dependencies To Verify Before Client Demo

- `backend/.env` has `GEMINI_API_KEY` for resume/chat AI behavior.
- MongoDB connection is available for persistent users, jobs, posts, contacts, and interviews.
- Email credentials are configured for production contact/newsletter delivery.
- `CALENDAR_SYNC_WEBHOOK_URL` is configured only if real calendar automation will be demonstrated.
