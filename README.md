# 🎓 PassBac: The ultimate AI-Powered Baccalaureate Assistant

> **Status**: Production-Ready & Optimized for Next.js 16.2 (Turbopack)

PassBac is a high-performance, full-stack educational platform designed to transform Baccalaureate preparation through cutting-edge AI and a refined user experience.

---

## 🌟 Key Functionalities & Features

### 🤖 AI Teacher Mode (Smart RAG)

The AI assistant is a **context-aware tutor** grounded in your specific course materials.

- **Retrieval-Augmented Generation (RAG)**: AI responses are strictly derived from your uploaded PDFs, ensuring accuracy and relevance.
- **Interactive Quick Actions**:
  - 💡 **Explain Simply**: Simplifies complex topics for easier understanding.
  - 📝 **Give me an Exercise**: Generates a practice problem based on the current material.
  - 🔑 **Key Points**: Instantly extracts the top 5 takeaways from a course.
- **Course-Scoped Knowledge**: Scopes AI knowledge to the active course to prevent study confusion.

### 📝 Interactive Quiz & Progress

- **AI Quiz Generation**: Automatically generates multiple-choice questions (QCM) from course content.
- **Real-Time Performance**: Tracks accuracy, quiz counts, and completion status.
- **Dynamic Stats Dashboard**: Students see their progress visualized with real-time data from Supabase.

### 👨‍💼 Professional Admin Suite (`/admin`)

- **Automated Content Pipeline**: Upload a PDF, and the system handles text extraction, chunking, and vector embedding generation (RAG) automatically.
- **Student Segmentation**: Categorize materials specifically for **Bac C** or **Bac D** students.
- **Resource Control**: Fully managed interface to view, upload, or delete courses and their AI data.

### 🔒 Advanced Authentication

- **Next.js 16/Proxy Engine**: Built on the latest experimental `proxy.ts` architecture for maximum speed and security.
- **Role-Based Access (RBAC)**: Strict server-side redirection for admin routes.
- **Auto-Sync Profiles**: A database trigger automatically sets up student profiles and progress trackers upon registration.
- **Smart Flow**: Remembers your destination and redirects you back home after login via `?next=` parameters.

---

## 🛠️ Technical Excellence

- **Design**: Premium glassmorphic UI with micro-animations and a responsive, subject-tailored color system.
- **Speed**: Optimized with **Groq & Llama 3.1 70B** for sub-2-second AI responses.
- **Security**: Robust session management using `@supabase/ssr` (HTTP-only cookies).
- **Search**: Semantic search powered by **OpenAI Embeddings** and **pgvector**.

---

## 📋 Rapid Setup Guide

### 1. Database Initialization

Run `supabase/setup.sql` in your Supabase SQL Editor. This script is idempotent and sets up:

- Tables for `profiles`, `courses`, `embeddings`, and `progress`.
- **Database Trigger** for automatic profile creation.
- RLS Policies and Storage Buckets.

### 2. Configuration

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # For PDF processing
OPENAI_API_KEY=... # For embeddings
GROQ_API_KEY=... # For AI Chat
```

### 3. Launch

```bash
npm install
npm run dev
```

---

## 🚀 Docker Deployment

To deploy PassBac using Docker, follow these steps:

1. **Build the Docker Image**:

   ```bash
   docker build -t passbac .
   ```

2. **Run the Container**:

   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
     -e OPENAI_API_KEY=your_openai_api_key \
     -e GROQ_API_KEY=your_groq_api_key \
     passbac
   ```

   Replace the environment variable values with your actual configuration from `.env.local`.

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

**Note**: Ensure Docker is installed and running on your system. The application will be available on port 3000.

---

_Created for the S3C Defi 4 — Elevating Baccalaureate Education through AI._
