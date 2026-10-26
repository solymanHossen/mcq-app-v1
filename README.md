# ExamHub 🎓

An online examination, MCQ question bank, and assessment platform built with Next.js, React 19, Tailwind CSS, Prisma, and PostgreSQL.

---

## ✨ Features

- **Question Bank & Exam Builder**: Create questions, organize by difficulty and category, and assemble timed exams.
- **Timed Exam Engine**: Auto-saving answers, time limit enforcement, tab-switch and blur detection anti-cheat proctoring.
- **Instant Auto-Grading**: Immediate calculation of scores, percentiles, accuracy breakdown, and rank assignments.
- **Real-Time Leaderboards**: Exam-level and global leaderboards with Redis caching and tie-breaking.
- **AI-Powered Explanations**: Automated mistake explanations and hints powered by Anthropic Claude.
- **Role-Based Access Control**: Tailored workflows for Students, Teachers, and Administrators (including Super Admin).
- **Public REST API**: OpenAPI 3.1-compliant REST API under `/api/v1` for mobile clients with token authentication.

---

## 🛠️ Project Name & Branding Configuration

ExamHub comes with an environment-driven branding system. The application name and tagline can be customized across the entire platform via environment variables in `.env`:

```env
# Application branding (accessible across client and server components)
NEXT_PUBLIC_APP_NAME="ExamHub"
NEXT_PUBLIC_APP_DESCRIPTION="Build question banks, run timed exams, and auto-grade results with proctoring, leaderboards, and AI explanations."
```

If these environment variables are omitted, the platform defaults to **ExamHub**.

### Code Usage

All UI components, page metadata, dashboard shells, and API documentation import the centralized configuration:

```tsx
import { APP_NAME, APP_DESCRIPTION } from "@/lib/config"
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20+ (recommended v22+)
- Docker & Docker Compose (for local Postgres & Redis)

### 2. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Review and update any keys as needed in `.env`.

### 3. Start Database & Services

```bash
docker compose up -d
```

### 4. Install Dependencies & Generate Prisma Client

```bash
npm install
npx prisma generate
```

### 5. Run Migrations & Seed Data

```bash
npx prisma migrate dev
npm run db:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Available Scripts

- `npm run dev`: Start Next.js development server with Turbopack.
- `npm run build`: Build production standalone application.
- `npm run start`: Start production server.
- `npm run typecheck`: Check TypeScript types (`tsc --noEmit`).
- `npm run lint`: Run ESLint.
- `npm run format`: Format source code with Prettier.
- `npm run test`: Run tests with Vitest.
