# Baccalaureate Preparation Assistant

MVP web application for Baccalaureate preparation, featuring a RAG-powered AI Assistant.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase (Postgres, pgvector, Storage, Auth)
- **AI**: OpenAI API (GPT-3.5-turbo, Text-Embedding-3-small)
- **PDF Parsing**: pdf-parse

## Getting Started

### 1. Database Setup
Execute the SQL commands in `supabase/setup.sql` in your Supabase project's SQL Editor to create tables, enable `pgvector`, and set up storage policies.

### 2. Environment Variables
Create a `.env.local` file by copying the provided example:
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL, Anon Key, Service Role Key, and OpenAI API Key.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

### 5. Demo Account
Log in with:
- **Email:** demo@test.com
- **Password:** demo123 (Make sure to create this user in Supabase Auth first!)

## Features
- **Auth**: Secure authentication via Supabase.
- **Dashboard**: Track simulated progress across subjects.
- **Courses**: Upload PDFs to a Supabase bucket. The API automatically extracts text, chunks it, embeds it using OpenAI, and stores it in pgvector.
- **AI Assistant**: RAG-powered chat that answers questions based *only* on the uploaded syllabus content.
- **Quiz System**: Simple instant-feedback UI for multiple choice questions.

## Docker Deployment
1. Build the image:
```bash
docker build -t bac-prep-mvp .
```
2. Run the container:
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... -e SUPABASE_SERVICE_ROLE_KEY=... -e OPENAI_API_KEY=... bac-prep-mvp
```
