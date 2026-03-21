# 🎓 BacPrep — AI-Powered Baccalaureate Preparation Assistant

A modern, full-stack web application that helps students prepare for their Baccalaureate exams using AI-powered tutoring, course management, and interactive quizzes.

---

## ✨ Features Overview

### 🔐 Authentication
- **Sign In / Sign Up** from separate, clean pages (`/login`, `/register`)
- Powered by **Supabase Auth** (email + password)
- **"Login as Demo"** button for instant access (demo@test.com)
- Session persisted via **HTTP-only cookies** using `@supabase/ssr`
- **Middleware route protection**: unauthenticated users are automatically redirected to `/login`

---

### 🏠 Dashboard (`/dashboard`)
- Personalized **welcome banner** with the user's name and gradient design
- **Module cards** linking to Courses, AI Tutor, and Quiz
- **Stats row**: Courses uploaded, Quizzes done, AI Chats, Avg score
- **Recent Activity** feed (mock data, ready for real tracking)

---

### 📚 Courses (`/courses`)
- View all uploaded **course PDFs** in a responsive card grid
- Cards are **color-coded by subject** (Mathematics = indigo, Physics = rose, Science = emerald)
- **Add Course modal**: enter a title, choose a subject, then upload a PDF
- PDF is stored in **Supabase Storage** (public bucket: `courses`)
- After upload, the PDF is automatically **processed for AI** (see RAG below)
- **Delete** a course with confirmation
- **"Ask AI"** shortcut on each card that opens the AI tutor scoped to that course

### 👨‍💼 Admin Dashboard (`/admin`)
- **Protected UI** for course management (visible only to `is_admin: true` users)
- **Course upload form**: title, subject, student type (C/D), and PDF file
- **Real-time processing**: uploads trigger the RAG pipeline automatically
- **Manage uploads**: view and delete recently uploaded courses
- **Automatic RAG**: extracts text and generates embeddings on the fly

---

### 🤖 AI Tutor (`/ai`)
- Clean, **chat-style interface** (no settings visible to users)
- **Online status indicator** in the chat header
- Scoped responses: if opened from a course card, answers reference **only that course's content**
- If the AI is temporarily unavailable, shows a **friendly message** — no error codes
- Uses **Retrieval-Augmented Generation (RAG)**:
  1. User's question is embedded as a vector
  2. Top 5 most relevant document chunks are retrieved from the DB
  3. Those chunks are injected into the AI prompt as context
  4. AI answers **only** from the provided content

---

### 📝 Quiz (`/quiz`)
- **Multiple-choice QCM** quiz system
- Progress bar tracking question completion
- Instant feedback after finishing: ✅ correct / ❌ incorrect per question
- **Score percentage display** and correct answer reveal
- "Retake Quiz" button to restart

---

### 🧠 RAG Pipeline (AI Knowledge Base)
When a PDF is uploaded:
1. **File** → stored in Supabase Storage
2. **Text** extracted using `pdf-parse`
3. **Chunked** into ~800-token segments
4. Each chunk **embedded** using OpenAI `text-embedding-3-small`
5. **Vectors stored** in Supabase using `pgvector` extension
6. On chat query: embedding similarity search via `match_documents` SQL function

---

## 🗄️ Database Schema

| Table | Fields |
|-------|--------|
| `courses` | `id`, `title`, `subject`, `pdf_url`, `created_at` |
| `embeddings` | `id`, `course_id`, `content`, `embedding (vector 1536)` |

**SQL Function**: `match_documents(query_embedding, match_count, filter_course_id?)`

---

## 🗂️ Project Structure

```
/app
  /login          → Sign-in page
  /register       → Sign-up page
  /dashboard      → Home after login
  /courses        → Course management
  /ai             → AI chat tutor
  /quiz           → Practice quiz
  /api/chat       → POST: RAG + AI response
  /api/upload     → POST: PDF processing & embedding

/components
  AuthProvider.tsx   → Global auth state
  Navbar.tsx         → Sticky nav with mobile bar
  LoginForm.tsx      → Email/password + Demo button
  RegisterForm.tsx   → Registration form
  ChatBox.tsx        → AI chat UI

/lib
  supabase.ts        → Supabase browser + service clients
  embeddings.ts      → OpenAI embedding generation
  pdf.ts             → PDF text extraction & chunking
  rag.ts             → Store & search document vectors

/utils/supabase
  client.ts          → SSR browser client
  server.ts          → SSR server client
  middleware.ts      → Session refresh & route protection

/middleware.ts        → Next.js route guard
/supabase/setup.sql  → Full DB setup script
```

---

## ⚙️ Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for PDF embeddings)
OPENAI_API_KEY=sk-...

# Chat AI — Groq is FREE and recommended
# Get key at: https://console.groq.com
GROQ_API_KEY=gsk_...
CHAT_MODEL=llama3-8b-8192
```

> **Note:** The chat provider is selected automatically:  
> **Groq** (if `GROQ_API_KEY` is set) → **OpenAI** (fallback)  
> This is configured server-side only — users never see provider details.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/setup.sql` in the SQL Editor (enables pgvector, creates tables, sets up storage)
3. Go to **Authentication → Users** and create: `demo@test.com` / `demo123`

### 3. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase and AI provider keys
```

### 4. Run Locally
```bash
npm run dev
# → http://localhost:3000
```

---

## 🐳 Docker Deployment

```bash
# Build
docker build -t bac-prep .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e OPENAI_API_KEY=... \
  -e GROQ_API_KEY=... \
  bac-prep
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + Inter font |
| Auth | Supabase Auth + `@supabase/ssr` |
| Database | Supabase Postgres + pgvector |
| Storage | Supabase Storage |
| AI Chat | Groq (free) or OpenAI GPT |
| Embeddings | OpenAI `text-embedding-3-small` |
| PDF Parsing | `pdf-parse` |
| Icons | Lucide React |
| Deployment | Vercel / Docker |

---

## 📋 Demo Account

| Field | Value |
|-------|-------|
| Email | demo@test.com |
| Password | demo123 |

> Make sure to create this user in your Supabase Auth dashboard before testing.
