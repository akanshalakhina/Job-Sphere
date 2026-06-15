# Job-Sphere 🌐

**Job-Sphere** is a modern, full-stack recruitment platform and job board. It offers tools for both **Candidates** (browsing jobs, tracking applications, ATS-based resume screening) and **Recruiters** (job posting, candidate leaderboards, application management).

---

## 🏗 Project Architecture

The project is structured entirely as a decoupled full-stack monorepo:

- **`frontend/`**: Built with React, Vite, and Tailwind CSS.
- **`backend/`**: Built with Node.js, Express, and MongoDB (via Mongoose).
- **`tests/`**: End-to-End (E2E) testing powered by Playwright.

*(Note: The old Replit artifacts folder has been excised to strictly maintain our optimal Vite + Express separation).*

---

## 🧠 Core Features & Code Context

### 1. **Dynamic ATS Scoring Engine** (`backend/src/routes/applications.ts`)
When a candidate applies to a job, the backend dynamically cross-references the candidate's defined `skills` against the `skills` array required by the Job model. It automatically creates an **ATS Relevance Score** mapped between 0 - 100 to estimate role fit based on skill overlap.

### 2. **Candidate Leaderboard for Recruiters** (`backend/src/routes/applications.ts`)
When recruiters view applicants for their posted job (`/applications/job/:jobId`), the backend intelligently sorts the array with:
```javascript
.sort({ atsScore: -1, createdAt: -1 })
```
This forces higher-matching ATS scored candidates to bubble to the top like a leaderboard.

### 3. **Advanced Job Search & Tooling** (`backend/src/routes/jobs.ts`)
The `/jobs` endpoint parses comprehensive `req.query` strings. Features active DB indexing to handle textual Regex searches, along with location mapping, department flags, and custom sorting implementations (newest vs salary vs high-applicants).

### 4. **Auth & Proxy Management** (`frontend/vite.config.js` / Clerk)
- **Frontend** proxies all `/api` calls directly to `localhost:3000` via Vite server config.
- **Backend Auth** uses Clerk Express middlewares (`requireAuth`) validating strict JWT bounds and differentiating UI/DB scopes for `'admin'`, `'recruiter'`, and `'candidate'`.

---

## 🚀 How to Run the App (Local Development)

### Prerequisites:
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas URI)
- **Clerk Auth Keys** (For user simulation/authentication)

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
*Make sure you have a valid `.env` in the `backend/` folder spanning MONGO_URI, CLERK_SECRET_KEY, etc. Running this command boots the server on port **3000**.*

### 2. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Boots the Vite React app on port **5173** and automatically maps API endpoints to backend's port 3000.*

---

## 🧪 Testing Suites

Our testing spans Unit, Integration, and End-to-End coverage seamlessly across environments.

### 1. Backend Testing (Vitest & Supertest)
Validates route schemas, DB fallback/mock interactions, and API status codes:
```bash
cd backend
npm install --legacy-peer-deps  # Just in case you hit esbuild peer issues
npm test
```

### 2. Frontend Testing (Vitest & React Testing Library)
Validates React UI rendering and state fallback boundaries gracefully:
```bash
cd frontend
npm test
```

### 3. End-to-End (E2E) Testing (Playwright)
Executes physical chromium browser sessions tracking UI workflow clicks, routing verification, and functional component visibility.
Run this from the **Root directory (`/Job-Sphere`)**:
```bash
npx playwright test
```
*You can view detailed interactive test analysis generated post-suite running `npx playwright show-report`.*
