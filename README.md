# AI Video Editing Client Finder

AI Video Editing Client Finder is a complete production-ready SaaS application designed for freelance video editors, agencies, and production teams. The platform automates the process of scanning YouTube and Instagram creators, extracting business inquiries, evaluating content activity (upload frequency, view engagement), and scoring leads using AI. It features an AI cold email pitch builder to instantly construct high-converting emails.

## Features

- **Authentication**: JWT-based secure auth (register, login, session guards).
- **Lead Finder**: Scan creator leads by niche, subscriber thresholds, and count.
- **Scraper Engine**: YouTube API crawler with Puppeteer scraping as a fallback. Includes a built-in **Mock Scraper Mode** for instant local testing without keys.
- **AI Scoring System**: Automatically evaluates lead quality (High, Medium, Low) using rule-based metrics or OpenAI GPT-4o analysis.
- **Outreach Assistant**: Synthesizes highly customized cold pitch emails highlighting recent video performance.
- **Leads Database & pipeline CRM**: Edit lead outreach status inline, search, filter, and delete.
- **Export Utility**: Download entire leads catalogs as Excel sheets or CSV sheets.
- **Admin Hub**: Global analytics dashboards, lead distributions, and audit logging.
- **Settings configuration**: Manage themes, YouTube & OpenAI keys, and customized pitch prompts.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion, TanStack React Query v5.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL with Prisma ORM.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD.
- **Testing**: Jest, Supertest.

---

## Project Structure

```
ai-video-editing-client-finder/
├── backend/                  # Express REST API, Scraper, AI Lead Scoring, Prisma ORM
│   ├── src/
│   │   ├── config/           # Database & Env variable parser
│   │   ├── controllers/      # Route controllers (Auth, Leads, Scraper, etc.)
│   │   ├── middleware/       # JWT Auth, error-handler, rate-limiters
│   │   ├── prisma/           # Schema definitions
│   │   ├── services/         # Scraper, AI scoring, Email generator
│   │   └── utils/            # CSV/Excel exporters
│   └── tests/                # Jest API tests & Scraper tests
├── frontend/                 # Next.js client
│   ├── src/
│   │   ├── app/              # Next.js app pages (Dashboard, Finder, Leads, Settings)
│   │   ├── components/       # UI layout shells (Sidebar, AuthProvider)
│   │   └── lib/              # Axios instance
│   └── public/
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Setup manual
```

---

## Environment Variables

Copy `.env.example` in both `frontend` and `backend` directories.

### Backend `.env` configuration
Create `backend/.env` containing:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clientfinder?schema=public
JWT_SECRET=ai-video-editing-client-finder-super-secret-key-2026
JWT_EXPIRES_IN=7d
```

### Frontend `.env` configuration
Create `frontend/.env.local` containing:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Option 1: Running via Docker Compose (Recommended)
This launches the PostgreSQL database, Express backend API, and Next.js frontend client automatically with a single command.

1. Ensure Docker Desktop is installed and running.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. The frontend is accessible at `http://localhost:3000` and the API backend runs at `http://localhost:5000`.

### Option 2: Running Locally (Manual Setup)

#### 1. Setup Database
Ensure you have a PostgreSQL server running locally, or use a hosted option (like Supabase).
1. Configure your `DATABASE_URL` in `backend/.env`.
2. Run database migrations:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
3. Generate client:
   ```bash
   npx prisma generate
   ```

#### 2. Run Backend
From the `backend` directory:
```bash
npm run dev
```

#### 3. Run Frontend
From the `frontend` directory:
```bash
npm run dev
```

---

## Testing Instructions

To run automated unit and integration tests:

### Backend Tests
Runs the API endpoint and Lead Scorer rules tests:
```bash
cd backend
npm run test
```

### Mock Scraper Testing (No Keys Needed)
By default, the application runs with **Mock Scraper Mode Enabled** (configured in the Settings tab). You do not need to create Google YouTube API credentials or OpenAI accounts to evaluate the application. Search keywords (like "gaming", "fitness") will immediately return realistic, analyzed leads.

To use real YouTube data:
1. Turn off **Enable Mock Scraper Mode** in `/dashboard/settings`.
2. Input a YouTube Data API Key and an OpenAI API Key.
3. Save Settings.
