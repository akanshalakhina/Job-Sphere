# Agent Handover Guidelines: JobSphere Implementation Status

This document tracks the issues that were called out during handover and the current implementation state after the latest fixes.

---

## 1. AI Resume Scanner / ATS Compatibility

### Completed
- `backend/src/routes/resume.ts` now rejects empty or near-empty resume extraction with HTTP `422` and this explicit error:
  ```json
  { "error": "Unable to extract text. Please ensure the PDF is not scanned/image-only and has selectable text." }
  ```
- The empty-text threshold is `50` extracted characters.
- For PDFs, the backend now attempts Gemini inline PDF analysis before rejecting the file. This supports scanned/image-heavy PDFs when `GEMINI_API_KEY` is configured.
- The Gemini helper in `backend/src/lib/gemini.ts` now supports both text prompts and inline file payloads.
- `frontend/src/pages/ResumeAnalyzerPage.jsx` no longer generates a random mock score for uploaded files. It surfaces the backend error if analysis fails.
- Successful resume analysis responses include `analyzedWith`, currently `text-extraction` or `gemini-inline-pdf`.

### Remaining External Dependency
- OCR/multimodal fallback uses the existing `GEMINI_API_KEY` from `backend/.env`. Do not introduce a second Gemini key variable name.
- DOCX upload is accepted by the UI/backend upload filter, but no local DOCX text parser is installed. Add a parser such as Mammoth if fully offline DOCX extraction is required.

---

## 2. Print Page Layout & Headers/Footers

### Completed
- Print CSS remains in `frontend/src/index.css`.
- `@page { margin: 0 !important; }` hides browser header/footer metadata.
- Root wrappers are reset for print to prevent extra blank pages.
- `#resume-sheet` owns print padding, dimensions, overflow, and color reset.

---

## 3. Chatbot Loading Indicator

### Completed
- `frontend/src/components/FloatingChatbot.jsx` tracks the actual `sendChatbotMessage` Promise.
- The typing indicator starts before the API call and stops in `finally`, so it stays visible until the response path completes.

---

## 4. Student Workspace Tabs Layout

### Completed
- Candidate dashboard title/action controls and tab controls are separate rows.
- Tabs use `lg:flex-nowrap` and `whitespace-nowrap` to preserve a single desktop row.

---

## 5. Mock Features Converted To Real Implementations

### A. Social Feed Metrics, Hashtags, And Public Profiles

### Completed
- `backend/src/models/User.ts`
  - Added `profileViews`, `postImpressions`, and `viewedTags`.
- `backend/src/models/Post.ts`
  - Added `hashtags` and `impressions`.
  - Added indexes for hashtag and author queries.
- `backend/src/routes/posts.ts`
  - Extracts hashtags when posts are created.
  - Increments post impressions and author post impressions when feed posts are fetched.
  - Adds `GET /api/posts/trending-tags` with a simple `mlWeight` signal derived from post frequency and impressions.
- `backend/src/routes/users.ts`
  - Adds `GET /api/users/public/:clerkId`, which returns a public profile and increments `profileViews` by default.
  - Adds `profileViews` and `postImpressions` to `/api/users/stats`.
- `frontend/src/pages/FeedPage.jsx`
  - Replaced hardcoded `240` profile views and `1,450` post impressions with backend stats.
  - Replaced static hashtag channel chips with `/api/posts/trending-tags` data.
  - Shows stored hashtags on posts.
  - Links feed profiles to public profile pages.
- `frontend/src/pages/PublicProfilePage.jsx`
  - New LinkedIn-style public profile page at `/profile/:clerkId`.

### Notes
- This adds ML-ready signals, not a full recommendation model. The `mlWeight` value is a lightweight ranking signal for future model work.

### B. Contact Us And Newsletter Emails

### Completed
- `backend/src/routes/communications.ts`
  - Adds `POST /api/contact`.
  - Adds `POST /api/newsletter/subscribe`.
- `backend/src/models/ContactMessage.ts`
  - Persists support tickets and business inquiries.
- `backend/src/models/NewsletterSubscriber.ts`
  - Persists newsletter subscribers and subscription status.
- `backend/src/lib/email.ts`
  - Adds a Resend-compatible transactional email adapter.
  - Uses `RESEND_API_KEY`, `FROM_EMAIL`, and `SUPPORT_EMAIL`.
  - Gracefully reports `provider: "disabled"` when email credentials are not configured.
- `frontend/src/pages/ContactPage.jsx`
  - Contact and business inquiry forms now submit to `/api/contact`.
  - The submit button uses explicit valid light-mode colors: brand-light background with brand-blue text, and solid brand blue in dark mode.
- `frontend/src/components/Footer.jsx`
  - Newsletter form now submits to `/api/newsletter/subscribe`.

### C. Interview Tracker And Calendar Sync

### Completed
- `backend/src/models/Interview.ts`
  - Added persisted `rounds`.
  - Added `calendar` sync metadata.
- `backend/src/lib/calendarSync.ts`
  - Adds default round generation.
  - Adds optional webhook calendar sync via `CALENDAR_SYNC_WEBHOOK_URL`.
- `backend/src/routes/interviews.ts`
  - Interview creation now stores default rounds and calendar sync metadata.
  - Adds `PATCH /api/interviews/:id/rounds/:roundId`.
  - Adds `POST /api/interviews/:id/sync-calendar`.
- `backend/src/lib/memoryDb.ts`
  - In-memory interview records now include rounds and calendar metadata for local/dev mode.
- `frontend/src/pages/RecruiterDashboard.jsx`
  - Booking an interview now sends candidate identity, avatar, company, role, notes, and schedule details to the backend.
- `frontend/src/pages/CandidateDashboard.jsx`
  - The interview tracker no longer renders a hardcoded HR/Technical/System Design/Offer layout.
  - It renders persisted interview rounds and calendar status from `/api/interviews`.

### Remaining External Dependency
- Real Google Calendar/Cal.com integration requires `CALENDAR_SYNC_WEBHOOK_URL` to point at a calendar automation endpoint.

---

## 6. UI Theme Reliability Fixes

### Completed
- Replaced invalid Tailwind shades across `frontend/src`, including examples such as:
  - `brand-650` -> `brand-600`
  - `slate-850` / `slate-855` -> `slate-800`
  - `slate-450` / `slate-455` / `slate-550` -> valid slate shades
  - `navy-850` / `navy-855` -> `navy-800`
  - `emerald-555` -> `emerald-500`
- Fixed invalid `to-indigo-650` gradients in chat/contact/admin surfaces.
- This prevents missing CSS classes from producing white-on-white or transparent UI in light mode.

---

## 7. General Agent Notes

- Authentication uses database JWT auth. Clerk has been removed from the active app path; some old mock compatibility helpers remain for tests.
- The MongoDB user `_id` continues to map to `clerkId` for backward compatibility.
- AI endpoints:
  - AI Coach: `/api/ai-coach`
  - SphereAI Chatbot: `/api/chat`
  - Resume analyzer: `/api/resume/analyze`
- Gemini model remains `gemini-flash-latest`.
- External-service environment variables:
  - `GEMINI_API_KEY` for Gemini text/PDF analysis. This key already exists in `backend/.env`; keep using that variable.
  - `RESEND_API_KEY` for transactional emails.
  - `GMAIL_USER` and `GMAIL_PASS` are now supported as the Gmail SMTP fallback when Resend is not configured.
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` are also supported for generic SMTP delivery.
  - `FROM_EMAIL` for outbound email identity.
  - `SUPPORT_EMAIL` for contact-ticket routing.
  - `CALENDAR_SYNC_WEBHOOK_URL` for calendar event sync.
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` for the env-backed admin login path.

---

## 8. Demo Credibility Pass

### Completed
- `frontend/src/pages/FeedPage.jsx`
  - Replaced static industry-news cards with platform-derived hiring insights from jobs, feed posts, and trending tags.
  - Replaced the empty suggested-people panel with backend-backed profile visibility metrics.
- `frontend/src/pages/CandidateDashboard.jsx`
  - Replaced monthly fake application chart data with current applied/saved/interview counts.
  - Replaced fallback `88%` ATS display with `Not analyzed` until resume analysis exists.
  - Removed the static `96% Accuracy` recommendation claim.
- `frontend/src/pages/RecruiterDashboard.jsx`
  - Replaced canned skill chart values with top skills aggregated from the current candidate pool.
- `frontend/src/pages/AdminDashboard.jsx`
  - Replaced hardcoded revenue, MRR, subscriber, GPU, and accuracy claims with platform-state diagnostics and billing-readiness notes.
  - Billing now clearly says provider connection is required before showing revenue.
- `frontend/src/pages/LandingPage.jsx`
  - Removed fake checkout/payment modal behavior.
  - Pricing CTAs now route to contact as plan setup inquiries.
  - Testimonials are labeled as demo user stories until client-approved references exist.
  - Resume preview uses generic candidate copy and no fake score.
- `frontend/src/pages/AuthPage.jsx`
  - Replaced named demo candidate and static score/salary proof with generic preview content.
- `backend/src/lib/email.ts`
  - Added Gmail/generic SMTP fallback via Nodemailer while keeping Resend as the preferred provider.
- `backend/src/routes/auth.ts`
  - Added env-backed admin login. The login form can use the configured admin username and password to receive an admin JWT.
- `frontend/src/pages/AuthPage.jsx`
  - Login/signup now expose Candidate, Recruiter, and Admin workspace options.
  - Login accepts email or username so the configured admin username can be used.

### Verification
- Backend typecheck, build, and tests passed after the email-provider update.
- Frontend build and tests passed after the UI credibility updates.
- Browser smoke verified Landing, Candidate Dashboard, and Feed markers. Recruiter/Admin were covered by build/tests because the existing local backend began hanging on later login attempts.

---

## 9. Remaining Mock Or Static Data

- `frontend/src/data/mockData.js` still provides static marketing content, skill catalogs, roadmaps, FAQs, testimonials, and certification suggestions.
- AI fallback responses in `backend/src/lib/openai.ts`, `backend/src/routes/aiCoach.ts`, and chatbot fallback logic remain intentional local-development fallbacks when API keys are missing or provider calls fail.
- The previously called-out mock feed metrics, hashtag chips, contact/newsletter handlers, and candidate interview rounds have been replaced with backend-backed implementations.
