# The Creator Crew — AI-Powered Content Creation Assistant

A full-stack web application designed for social media creators to generate on-brand captions and hooks, manage draft versions centrally, receive optimal posting time recommendations, schedule multi-channel distribution, predict audience attention drop-off, and close the performance loop.

---

## 🏛️ System Architecture

```text
├── backend/                  # Python FastAPI Backend Architecture
│   ├── app/
│   │   ├── core/             # Configuration & Security (JWT, bcrypt)
│   │   ├── db/               # Database engine, SQLAlchemy Models, Seed Data
│   │   ├── schemas/          # Pydantic Request & Response Schemas
│   │   ├── services/         # Domain Business Logic (FR-1 through FR-12)
│   │   ├── adapters/         # AI Provider & Social Media OAuth Adapters
│   │   ├── jobs/             # Publishing Cron Jobs & Reminder Dispatcher
│   │   ├── routes/           # FastAPI API Endpoints
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── tests/                # Pytest Test Suite
│   ├── alembic.ini           # Alembic Database Migrations Config
│   └── requirements.txt      # Python Dependencies
├── src/                      # Frontend Application (Vite + React 19 + TypeScript + Tailwind)
│   ├── components/           # UI Modules (Compose, Vault, Style, Scheduler, Optimizer, Insights, Team)
│   ├── context/              # Authentication & User Session Context (FR-1 OTP)
│   ├── services/             # Client Storage, AI Engine, Retention Optimizer, Scheduler
│   └── types/                # Domain TypeScript Interfaces
├── index.html                # Light-mode entrypoint
└── package.json              # Node dependencies & build scripts
```

---

## 🚀 Core Feature Pillars (FR-1 through FR-12)

1. **Pillar 1: Create — AI Smart Keyboard (FR-1, FR-2, FR-3)**
   - Registration with email and mobile number, verified via 6-digit OTP (FR-1).
   - Generates $\ge 3$ caption/hook variants and up to 10 trend-aware hashtags within 3 seconds, with measured response latency (FR-2).
   - Brand tone selection: *Aesthetic*, *Funny*, or *Professional* that modulates vocabulary before display (FR-3).

2. **Pillar 2: Manage — Draft Vault (FR-4, FR-5)**
   - Auto-categorized drafts with instant full-text search under 2 seconds (FR-4).
   - Retains the last 5 revisions of every draft, with one-click preview and rollback (FR-5).

3. **Pillar 3: Personalize — Style Memory Engine (FR-6)**
   - Builds a personalized style profile from $\ge 10$ past posts (pre-seeded with 12 sample posts).
   - Automatically re-ranks AI suggestions based on creator tone vector and vocabulary affinity.

4. **Pillar 4: Distribute — Smart Scheduler (FR-7, FR-8, FR-9)**
   - AI-recommended optimal posting time based on 30-day historical analytics; accept or override (FR-7).
   - Platform format adaptation (Instagram paragraphs/hashtags at bottom, TikTok compact hook, YouTube descriptions) (FR-8).
   - Auto-publishes when OAuth is connected, or dispatches an in-app reminder notification 15m prior (FR-9).
   - Explicit "Confirm Publish" safety verification step (NFR-8).

5. **Pillar 5: Optimize — Attention Span Optimizer (FR-10, FR-12)**
   - Predicts audience drop-off timestamps in copy and suggests high-converting hook and CTA replacements (FR-10).
   - Ingests likes, comments, shares, and retention data after publication, immediately recalibrating Style Memory and Scheduler models in real time (FR-12).

6. **Team Collaboration (FR-11)**
   - Multi-role workspace where Owners invite Reviewers by email.
   - Reviewers Approve, Request Rework, or Discard drafts with a shared audit trail.

---

## 🛠️ Local Development & Running the App

### Frontend (Live in AI Studio on Port 3000)
```bash
npm install
npm run dev
```

### Backend (Python FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Pre-Seeded Demo Accounts
- **Creator / Owner:** `creator@crew.com` (Owner permissions, 12 seeded past posts, pre-calibrated Style Profile)
- **Reviewer:** `reviewer@crew.com` (Reviewer permissions, review queue access)
