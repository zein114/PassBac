# 🎓 BacPrep — Competition-Ready AI Baccalaureate Assistant
> **Status**: Production-Ready & Optimized for Next.js 16.2 (Turbopack)

BacPrep is a high-performance, full-stack educational platform designed to transform Baccalaureate preparation. It leverages **RAG (Retrieval-Augmented Generation)** to provide students with a private, course-specific AI Tutor that knows their curriculum perfectly.

---

## 🚀 Key Production Features

### 🔐 Advanced Authentication (Next.js 16/Proxy)
- **Experimental Proxy Engine**: Fully compatible with Next.js 16's new `proxy.ts` convention.
- **Role-Based Access Control (RBAC)**: Strict server-side redirection for `/admin` routes.
- **Automatic Profile Sync**: Uses a database trigger in Supabase to instantly create student profiles (`Bac C/D`) upon registration.
- **Smart Redirection**: Remembers your intended destination after login via `?next=` parameters.

### 🤖 AI Teacher Mode (`/ai`)
- **Direct Context RAG**: AI responses are strictly grounded in your uploaded PDF materials.
- **Interactive Quick Actions**:
  - 💡 *Explain Simply*: Breaks down complex topics into "ELI5" language.
  - 📝 *Give me an Exercise*: Generates practice problems based on current course context.
  - 🔑 *Key Points*: Summarizes the most important concepts for quick revision.

### 👨‍💼 Professional Admin Suite (`/admin`)
- **Content Pipeline**: Upload a PDF, and the system automatically extracts text, chunks it, and generates embeddings.
- **Multi-Serie Support**: Categorize courses specifically for **Bac C** or **Bac D** students.
- **Resource Management**: Real-time course deletion and storage synchronization.

### 📈 Progress & Analytics
- **Dynamic Dashboard**: Real-time stats for courses viewed, quizzes completed, and average scores.
- **Integrated Quizzes**: Smart QCM generation from course content to test understanding instantly.

---

## 🛠️ Technical Excellence

| Component | Technology |
|-----------|------------|
| **Core** | Next.js 16.2 (App Router + Turbopack) |
| **Auth** | Supabase SSR (Safe Session Refresh) |
| **DB** | PostgreSQL + `pgvector` for Semantic Search |
| **AI** | OpenAI (Embeddings) + Groq (Llama 3.1 70B for Chat) |
| **UI** | Modern CSS (Glassmorphism & Micro-animations) |

---

## 📋 Rapid Setup Guide

### 1. Database Initialization
Run `supabase/setup.sql` in your Supabase SQL Editor. This script is **idempotent** (can be run multiple times safely) and sets up:
- Vector search extensions.
- Tables for `profiles`, `courses`, `embeddings`, and `progress`.
- **Auth Triggers** for automatic profile creation.
- Storage buckets and RLS policies.

### 2. Environment Configuration
Create a `.env.local` file with the following:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # Required for PDF processing
OPENAI_API_KEY=... # For text-embedding-3-small
GROQ_API_KEY=... # For high-speed chat
ADMIN_SECRET=your-secret # For protected APIs
```

### 3. Launch
```bash
npm install
npm run dev
```

---

## 📋 Credentials
- **Admin**: `admin@test.com` / `admin123`
- **Demo Student**: `demo@test.com` / `demo123` (Select "Bac C" or "Bac D" in UI)

---
*Created for the S3C Defi 4 — Baccalaureate Preparation Competition.*
